import { GraphQLError } from "graphql"
import { AppDataSource } from "../db/dataSource"
import { Author, Book, Chapter, Comment, Library, LibraryBook, Reply, Review, User } from "../entities"
import { Context, NotificationStatus, Role } from "../utils/types"
import { errorHandler, verifyLogin } from "../utils"
import { hash } from "bcryptjs"
import { PASSWORD_HASH_SALT } from "../config"
import { AuthorNotification, UserNotification } from "../entities/notification.entity"

const authorRepository = AppDataSource.getRepository(Author)
const bookRepository = AppDataSource.getRepository(Book)
const userRepository = AppDataSource.getRepository(User)
const chapterRepository = AppDataSource.getRepository(Chapter)
const libraryRepository = AppDataSource.getRepository(Library)
const libraryBookRepository = AppDataSource.getRepository(LibraryBook)
const reviewRepository = AppDataSource.getRepository(Review)
const commentRepository = AppDataSource.getRepository(Comment)
const replyRepository = AppDataSource.getRepository(Reply)
const authorNotificationRepo = AppDataSource.getRepository(AuthorNotification)
const userNotificationRepo = AppDataSource.getRepository(UserNotification)

export const resolvers = {
    Query: {
        me: (_: null, args: null, context: Context) => {
            if (context.author) return context.author
            else if (context.user) return context.user
            else {
                throw new GraphQLError(
                    'Unauthorized',
                    {
                        extensions: {
                            code: 'UNAUTHORIZED'
                        }
                    }
                )
            }

        },
        authors: async () => {
            const authors = await authorRepository.find()
            return authors
        },
        author: async (_: null, args: { username: string }) => {
            return await authorRepository.find({ where: { username: args.username } })
        },
        books: async (_: null, args: { name?: string }) => {
            if (args.name) {
                return await bookRepository.find({ where: { name: args.name } })
            }
            return bookRepository.find()
        },
        book: async (_: null, args: { name?: string, authorName?: string, bookId?: string }) => {
            let book;
            if (args.bookId) {
                [book] = await bookRepository.find({ where: { bookId: args.bookId } })
                return book
            }
            [book] = await bookRepository.find({ where: { name: args.name, author: { username: args.authorName } } })
            return book
        },
        findBooksByTag: async (_: null, args: { tag: string }) => {
            const books = await bookRepository.find({ where: { tags: args.tag } }) //fix this
            return books
        },
        user: async (_: null, args: { username?: string, id: string }) => {
            if (args.id) {
                return await userRepository.find({ where: { userId: args.id } })
            }
            else if (args.username) {
                return await userRepository.find({ where: { username: args.username } })
            }

        },
        chapter: async (_: null, args: { chapterId: string, bookId: string }) => {
            const chapter = await chapterRepository.findOne({ where: { chapterId: args.chapterId, book: { bookId: args.bookId } } })
            if (!chapter) errorHandler('Chapter of Book not found', 'NOT_FOUND')
            else if (chapter && chapter.paywall !== false) errorHandler('Access to locked chapter denied', 'FORBIDDEN')
            return chapter
        },
        chapterForLoggedInUsers: async (_: null, args: { chapterId: string, bookId: string }, context: Context) => {
            if (context.author) {
                const book = await bookRepository.findOne({ where: { bookId: args.bookId } });
                if (!book) errorHandler('Book not found', 'NOT_FOUND')
                if (book?.author.authorId !== context.author.authorId) {
                    const chapter = await chapterRepository.findOne({ where: { chapterId: args.chapterId, book: { bookId: args.bookId } } })
                    if (!chapter) errorHandler('Chapter of Book not found', 'NOT_FOUND')
                    else if (chapter && chapter.paywall !== false) errorHandler('Access to locked chapter denied', 'FORBIDDEN')
                    return chapter
                }
                return await chapterRepository.findOne({ where: { chapterId: args.chapterId, book: { bookId: args.bookId } } })
            }
            else if (context.user) {
                //handle searching from librarybook here
                const libraryBook = await libraryBookRepository.findOne({ where: { bookId: args.bookId, library: { user: context.user } } })
                if (!libraryBook) {
                    const chapter = await chapterRepository.findOne({ where: { chapterId: args.chapterId, book: { bookId: args.bookId } } })
                    if (!chapter) errorHandler('Chapter of Book not found', 'NOT_FOUND')
                    else if (chapter && chapter.paywall) errorHandler('Access to locked chapter denied', 'FORBIDDEN')
                    return chapter
                }
                const chapter = await chapterRepository.findOne({ where: { chapterId: args.chapterId, book: { bookId: args.bookId } } })
                if (!chapter) errorHandler('Chapter of Book not found', 'NOT_FOUND')
                else if (!chapter.paywall || libraryBook.paidChapters.includes(chapter.number)) {
                    libraryBook.currentChapter = chapter.number
                    await libraryBookRepository.save(libraryBook)
                    return chapter
                }
                errorHandler('Access to locked chapter denied', 'FORBIDDEN')
            }
            else errorHandler('Unauthorized', 'UNAUTHORIZED');
        },
        library: async (_: null, args: null, context: Context) => {
            if (context.user) {
                return await libraryRepository.find({ where: { user: context.user } })
            }
            else errorHandler('Unauthorized', 'UNAUTHORIZED');

        },
        review: async (_: null, args: { bookId: string }, context: Context) => {
            if (context.user) {
                const review = await reviewRepository.findOne({ where: { user: context.user, book: { bookId: args.bookId } } })
                if (review) return review
                errorHandler('Review Not Found', 'NOT_FOUND')
            }
            else errorHandler('Unauthorized', 'UNAUTHORIZED');
        },
        authorNotification: async (_: null, args: {notificationId: string}, context: Context) => {
            if(context.author){
                const notification = await authorNotificationRepo.findOne({where: {author: context.author, notificationId: args.notificationId}})
                if (notification){
                    notification.status = NotificationStatus.READ
                    const updatedNotification = await authorNotificationRepo.save(notification);
                    return updatedNotification
                }
                errorHandler('Notification Not Found', 'NOT_FOUND')
            }
            errorHandler('Unauthorized', 'UNAUTHORIZED');
        },
         userNotification: async (_: null, args: {notificationId: string}, context: Context) => {
            if(context.user){
                const notification = await userNotificationRepo.findOne({where: {user: context.user, notificationId: args.notificationId}})
                if (notification){
                    notification.status = NotificationStatus.READ
                    const updatedNotification = await userNotificationRepo.save(notification);
                    return updatedNotification
                }
                errorHandler('Notification Not Found', 'NOT_FOUND')
            }
            errorHandler('Unauthorized', 'UNAUTHORIZED');
        }
    },

    Mutation: {
        login: async (_: null, args: { email: string, password: string }) => {
            let token: string

            if (!args.email || !args.password) throw new GraphQLError('Email or Password not provided', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    invalidArgs: args
                }
            })
            const user = await userRepository.findOne({ where: { email: args.email } })
            if (user) {
                token = await verifyLogin({ password: user.password, id: user.userId, role: Role.User, username: user.username }, args)
            }
            const author = await authorRepository.findOne({ where: { email: args.email } })
            if (author) {
                token = await verifyLogin({ password: author.password, id: author.authorId, role: Role.Author, username: author.username }, args)
            }
            return { value: token! };

        },
        createAuthor: async (_: null, args: {
            username: string,
            email: string,
            password: string
        }) => {
            if (!args.email || !args.password || !args.username) throw new GraphQLError('Missing Info', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    invalidArgs: args
                }
            })

            const userWithUsername = await userRepository.findOne({ where: { username: args.username } })
            if (userWithUsername) throw new GraphQLError('Username not unique', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    invalidArgs: args
                }
            })
            const authorWithUsername = await authorRepository.findOne({ where: { username: args.username } })
            if (authorWithUsername) throw new GraphQLError('Username not unique', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    invalidArgs: args
                }
            })
            const hashedPassword = await hash(args.password, PASSWORD_HASH_SALT);
            const author = authorRepository.create({ username: args.username, email: args.email, password: hashedPassword, books: [] })
            return author
        },
        createUser: async (_: null, args: { username: string, email: string, password: string }) => {
            if (!args.email || !args.password || !args.username) throw new GraphQLError('Missing Info', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    invalidArgs: args
                }
            })

            const userWithUsername = await userRepository.findOne({ where: { username: args.username } })
            if (userWithUsername) throw new GraphQLError('Username not unique', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    invalidArgs: args
                }
            })
            const authorWithUsername = await authorRepository.findOne({ where: { username: args.username } })
            if (authorWithUsername) throw new GraphQLError('Username not unique', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    invalidArgs: args
                }
            })

            const library = new Library()
            const hashedPassword = await hash(args.password, PASSWORD_HASH_SALT);
            const user = userRepository.create({ username: args.username, email: args.email, password: hashedPassword, library: library })
            library.user = user
            await libraryRepository.save(library)
            return user
        },
        createBook: async (_: null, args: { name: string, summary: string, tags: string[] }, context: Context) => {
            if (!context.author) {
                throw new GraphQLError(
                    'Unauthorized',
                    {
                        extensions: {
                            code: 'UNAUTHORIZED'
                        }
                    }
                )
            }
            const book = bookRepository.create({ name: args.name, summary: args.summary, tags: args.tags, author: context.author })
            return book
        },
        addChapter: async (_: null, args: { number: number, title: string, content: string, bookId: string, paywall: boolean }, context: Context) => {
            if (!context.author) {
                throw new GraphQLError(
                    'Unauthorized',
                    {
                        extensions: {
                            code: 'UNAUTHORIZED'
                        }
                    }
                )
            }
            const book = await bookRepository.findOne({ where: { bookId: args.bookId } })
            if (!book) {
                throw new GraphQLError(
                    'Book with bookId provided not found',
                    {
                        extensions: {
                            code: 'BAD_USER_INPUT'
                        }
                    }
                )
            }
            if (book.author.authorId !== context.author.authorId) {
                throw new GraphQLError(
                    'Unauthorized',
                    {
                        extensions: {
                            code: 'UNAUTHORIZED'
                        }
                    }
                )
            }
            const chapter = chapterRepository.create({ number: args.number, title: args.title, content: args.content, paywall: args.paywall, book: book })
            return chapter
        },
        deleteChapter: async (_: null, args: { chapterId: string }, context: Context) => {
            if (!context.author) {
                throw new GraphQLError(
                    'Unauthorized',
                    {
                        extensions: {
                            code: 'UNAUTHORIZED'
                        }
                    }
                )
            }
            const chapter = await chapterRepository.findOne({ where: { chapterId: args.chapterId } })
            if (!chapter) errorHandler('No chapter associated with chapterId', 'BAD_USER_INPUT')
            if (chapter?.book.author.authorId !== context.author.authorId) errorHandler('Unauthorized', 'UNAUTHORIZED');

            await chapterRepository.delete({ chapterId: args.chapterId })
            return 'chapter deleted successfully'
        },
        addBookToLibrary: async (_: null, args: { bookId: string }, context: Context) => {
            if (!context.user) errorHandler('Unauthorized', 'UNAUTHORIZED');

            const book = await bookRepository.findOne({ where: { bookId: args.bookId } })
            if (!book) errorHandler('No book associated with bookId', 'BAD_USER_INPUT')

            const libraryBook = libraryBookRepository.create({ bookId: args.bookId, library: context.user?.library })
            return await libraryBookRepository.save(libraryBook)
        },
        deleteBookFromLibrary: async (_: null, args: { libraryBookId: string }, context: Context) => {
            if (context.user) {
                await libraryBookRepository.delete({ libraryBookId: args.libraryBookId, library: context.user.library })
                const library = await libraryRepository.findOne({ where: { libraryId: context.user.library.libraryId } })
                return library
            }
            errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
        updateLibraryBookPaidChapters: async (_: null, args: { libraryBookId: string, newPaidChapters: number[] }, context: Context) => {
            if (context.user) {
                const libraryBook = await libraryBookRepository.findOne({ where: { libraryBookId: args.libraryBookId, library: context.user.library } });
                if (libraryBook) {
                    const allPaidChapters = libraryBook.paidChapters.concat(args.newPaidChapters);
                    libraryBook.paidChapters = allPaidChapters
                    await libraryBookRepository.save(libraryBook);
                }
                errorHandler('Book not in library', 'FORBIDDEN')
            }
            errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
        addReview: async (_: null, args: { rating: number, bookId: string }, context: Context) => {
            if (context.user) {
                const book = await bookRepository.findOne({ where: { bookId: args.bookId } })
                if (book) {
                    const existingReview = await reviewRepository.findOne({ where: { user: context.user, book: book } })
                    if (!existingReview) return reviewRepository.create({ rating: args.rating, book: book, user: context.user })
                    errorHandler('Review For Book Already Exists', 'FORBIDDEN')
                }
                errorHandler('Book Not found', 'NOT_FOUND')
            }
            errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
        editReview: async (_: null, args: { reviewId: string, rating: number, bookId: string }, context: Context) => {
            if (context.user) {
                const book = await bookRepository.findOne({ where: { bookId: args.bookId } })
                const review = await reviewRepository.findOne({ where: { reviewId: args.reviewId, user: context.user } });
                if (book && review) {
                    return reviewRepository.update({ reviewId: args.reviewId }, { rating: args.rating })
                }
                errorHandler('Book or Review Not Found', 'NOT_FOUND')
            }
            errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
        deleteReview: async (_: null, args: { reviewId: string }, context: Context) => {
            if (context.user) {
                return await reviewRepository.delete({ reviewId: args.reviewId, user: context.user })
            }
            errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
        addComment: async (_: null, args: {content: string, bookId: string}, context: Context) => {
            if(context.user){
                const book = await bookRepository.findOne({where:{bookId: args.bookId}})
                if (book) return commentRepository.create({content: args.content, user: context.user, book: book})
                errorHandler('Book Not Found', 'NOT_FOUND')
            }
            errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
        editComment: async (_: null, args: {commentId: string, content: string}, context: Context) => {
            if(context.user){
                const comment = await commentRepository.findOne({where: {user: context.user, commentId: args.commentId}})
                if (comment) {
                    return await commentRepository.update({commentId: args.commentId},{content: args.content})
                }
                errorHandler('Comment Not Found', 'NOT_FOUND')
            }
            errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
        deleteComment: async (_: null, args: {commentId: string}, context: Context) => {
            if(context.user){
                await commentRepository.delete({commentId: args.commentId, user: context.user})
            }
            errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
        addReply: async (_: null, args: {content: string, commentId: string}, context: Context) => {
            if(context.user){
                const comment = await commentRepository.findOne({where:{commentId: args.commentId}})
                if (comment) return replyRepository.create({content: args.content, user: context.user, comment: comment})
                errorHandler('Book Not Found', 'NOT_FOUND')
            }
            errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
        deleteReply: async (_: null, args: {replyId: string}, context: Context) => {
            if(context.user){
                await replyRepository.delete({replyId: args.replyId, user: context.user})
            }
            errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
        addAuthorNote: async (_: null, args: {content: string, bookId: string}, context: Context) => {
            if(context.author){
                const book = await bookRepository.findOne({where: {bookId: args.bookId}})
                if (book){
                    book.authorNotes = book.authorNotes.concat([{note: args.content, date: Date.now()}])
                }
                errorHandler('Book Not Found', 'NOT_FOUND')
            }
            errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
    }
}