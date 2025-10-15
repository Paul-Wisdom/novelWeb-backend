import { __Type, GraphQLError } from "graphql"
import { AppDataSource } from "../db/dataSource"
import { Admin, Author, AuthorNote, Book, Chapter, Comment, Library, LibraryBook, PaidChapter, Reply, Review, Tag, User } from "../entities"
import { Context, NotificationStatus, Role } from "../utils/types"
import { errorHandler, generatePassword, verifyLogin } from "../utils"
import { compare, hash } from "bcryptjs"
import { PASSWORD_HASH_SALT } from "../config"
import { AuthorNotification, UserNotification } from "../entities/notification.entity"
import { Mail } from "../entities/mail.entity"

const authorRepository = AppDataSource.getRepository(Author)
const bookRepository = AppDataSource.getRepository(Book)
const authorNoteRepo = AppDataSource.getRepository(AuthorNote)
const tagRepository = AppDataSource.getRepository(Tag)
const userRepository = AppDataSource.getRepository(User)
const adminRepository = AppDataSource.getRepository(Admin)
const chapterRepository = AppDataSource.getRepository(Chapter)
const paidChapterRepo = AppDataSource.getRepository(PaidChapter)
const libraryRepository = AppDataSource.getRepository(Library)
const libraryBookRepository = AppDataSource.getRepository(LibraryBook)
const reviewRepository = AppDataSource.getRepository(Review)
const commentRepository = AppDataSource.getRepository(Comment)
const replyRepository = AppDataSource.getRepository(Reply)
const authorNotificationRepo = AppDataSource.getRepository(AuthorNotification)
const userNotificationRepo = AppDataSource.getRepository(UserNotification)
const mailRepository = AppDataSource.getRepository(Mail)

export const resolvers = {
    CombinedUser: {
        __resolveType: (obj: null, context: Context, info: null) => {
            if (context.author) return 'Author'
            else if (context.user) return 'User'
            else if (context.admin || context.superAdmin) return 'Admin'
            return null
        }
    },
    Query: {
        me: (_: null, args: null, context: Context) => {
            console.log(context)
            if (context.author) return context.author
            else if (context.user) return context.user
            else if (context.admin || context.superAdmin) return context.admin? context.admin: context.superAdmin
            else {
                throw errorHandler('Unauthorized','UNAUTHORIZED')
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
            const books = await bookRepository.find({relations: ['author', 'tags']})
            console.log(books)
            return books
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
        tags: async () => {
            const tags = await tagRepository.find({})
            return tags
        },
        findBooksByTags: async (_: null, args: { tagIds: string[] }) => {
            const tagIds = args.tagIds
            const tags = await Promise.all(tagIds.map(tagId => tagRepository.findOne({ where: { tagId: tagId } })))
            const cleanedTags = tags.filter(tag => tag !== null)
            const books = await bookRepository.createQueryBuilder('book').where('book.tags @> :tags', { tags: cleanedTags }).getMany()
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
            if (!chapter) throw errorHandler('Chapter of Book not found', 'NOT_FOUND')
            else if (chapter && chapter.paywall !== false) throw errorHandler('Access to locked chapter denied', 'FORBIDDEN')
            return chapter
        },
        chapterForLoggedInUsers: async (_: null, args: { chapterId: string, bookId: string }, context: Context) => {
            if (context.author) {
                const book = await bookRepository.findOne({ where: { bookId: args.bookId } });
                if (!book) throw errorHandler('Book not found', 'NOT_FOUND')
                if (book?.author.authorId !== context.author.authorId) {
                    const chapter = await chapterRepository.findOne({ where: { chapterId: args.chapterId, book: { bookId: args.bookId } } })
                    if (!chapter) throw errorHandler('Chapter of Book not found', 'NOT_FOUND')
                    else if (chapter && chapter.paywall !== false) throw errorHandler('Access to locked chapter denied', 'FORBIDDEN')
                    return chapter
                }
                return await chapterRepository.findOne({ where: { chapterId: args.chapterId, book: { bookId: args.bookId } } })
            }
            else if (context.user) {
                //handle searching from librarybook here
                const libraryBook = await libraryBookRepository.findOne({ where: { bookId: args.bookId, library: { user: context.user } } })
                if (!libraryBook) {
                    const chapter = await chapterRepository.findOne({ where: { chapterId: args.chapterId, book: { bookId: args.bookId } } })
                    if (!chapter) throw errorHandler('Chapter of Book not found', 'NOT_FOUND')
                    else if (chapter && chapter.paywall) throw errorHandler('Access to locked chapter denied', 'FORBIDDEN')
                    return chapter
                }
                const chapter = await chapterRepository.findOne({ where: { chapterId: args.chapterId, book: { bookId: args.bookId } } })
                if (!chapter) throw errorHandler('Chapter of Book not found', 'NOT_FOUND')
                const paidChapter = await paidChapterRepo.findOne({ where: { chapterId: chapter?.chapterId } })
                if (!chapter!.paywall || paidChapter) {
                    libraryBook.currentChapter = chapter!.number
                    await libraryBookRepository.save(libraryBook)
                    return chapter
                }
                throw errorHandler('Access to locked chapter denied', 'FORBIDDEN')
            }
            else throw errorHandler('Unauthorized', 'UNAUTHORIZED');
        },
        library: async (_: null, args: null, context: Context) => {
            if (context.user) {
                return await libraryRepository.find({ where: { user: context.user } })
            }
            else throw errorHandler('Unauthorized', 'UNAUTHORIZED');

        },
        review: async (_: null, args: { bookId: string }, context: Context) => {
            if (context.user) {
                const review = await reviewRepository.findOne({ where: { user: context.user, book: { bookId: args.bookId } } })
                if (review) return review
                throw errorHandler('Review Not Found', 'NOT_FOUND')
            }
            else throw errorHandler('Unauthorized', 'UNAUTHORIZED');
        },
        authorNotification: async (_: null, args: { notificationId: string }, context: Context) => {
            if (context.author) {
                const notification = await authorNotificationRepo.findOne({ where: { author: context.author, notificationId: args.notificationId } })
                if (notification) {
                    notification.status = NotificationStatus.READ
                    const updatedNotification = await authorNotificationRepo.save(notification);
                    return updatedNotification
                }
                throw errorHandler('Notification Not Found', 'NOT_FOUND')
            }
            throw errorHandler('Unauthorized', 'UNAUTHORIZED');
        },
        userNotification: async (_: null, args: { notificationId: string }, context: Context) => {
            if (context.user) {
                const notification = await userNotificationRepo.findOne({ where: { user: context.user, notificationId: args.notificationId } })
                if (notification) {
                    notification.status = NotificationStatus.READ
                    const updatedNotification = await userNotificationRepo.save(notification);
                    return updatedNotification
                }
                throw errorHandler('Notification Not Found', 'NOT_FOUND')
            }
            throw errorHandler('Unauthorized', 'UNAUTHORIZED');
        }
    },

    Mutation: {
        login: async (_: null, args: { loginInput: { email: string, password: string } }) => {
            let token: string
            const email = args.loginInput.email
            const password = args.loginInput.password

            if (!email || !password) throw errorHandler('Email or Password not provided','BAD_USER_INPUT',args.loginInput)
            const user = await userRepository.findOne({ where: { email: email } })
            if (user) {
                token = await verifyLogin({ password: user.password, id: user.userId, role: Role.USER, username: user.username }, args.loginInput) as string
                return { value: token }
            }
            const author = await authorRepository.findOne({ where: { email: email } })
            if (author) {
                token = await verifyLogin({ password: author.password, id: author.authorId, role: Role.AUTHOR, username: author.username }, args.loginInput) as string
                return { value: token }
            }
            throw errorHandler('Invalid Email or password', 'BAD_USER_INPUT', args.loginInput)

        },
        adminLogin: async (_: null, args: { loginInput: { email: string, password: string } }) => {
            let token: string
            const email = args.loginInput.email
            const password = args.loginInput.password

            if (!email || !password) throw errorHandler('Email or Password not provided', 'BAD_USER_INPUT', args.loginInput)

            const admin = await adminRepository.findOne({ where: { email: email } })
            console.log(admin)
            if (admin) {
                const adminRole = admin.username === 'super' ? Role.SUPERADMIN : Role.ADMIN
                token = await verifyLogin({ password: admin.password, id: admin.adminId, role: adminRole, username: admin.username }, args.loginInput) as string
                return { value: token}
            }

            throw errorHandler('Invalid Email or password', 'BAD_USER_INPUT', args.loginInput)

        },
        createAdmin: async (_: null, args: {
            username: string,
            email: string
        }, context: Context) => {
            if (!context.admin && !context.superAdmin) throw errorHandler('Unauthorized', 'UNAUTHORIZED')
            const email = args.email
            const username = args.username

            if (!email || !username || username.length < 3) throw errorHandler('Missing Info or Minimum length requirement failed', 'BAD_USER_INPUT', args)
            const sameEmail = await adminRepository.findOne({where: {email: email}})
            if(sameEmail) throw errorHandler('Email already in use', 'BAD_USER_INPUT')

            const sameUsername = await adminRepository.findOne({where: {username: username}})
            if(sameUsername) throw errorHandler('Username already in use', 'BAD_USER_INPUT')

            const password = generatePassword();
            console.log(password)
            const hashedPassword = await hash(password, 7)
            const admin = await adminRepository.save(adminRepository.create({ username: username, email: email, password: hashedPassword }))
            return admin
        },
        changeAdminPassword: async (_: null, args: { adminId: string, oldPassword: string, newPassword: string }, context: Context) => {
            if (!context.admin) throw errorHandler('Unauthorized', 'UNAUTHORIZED')
            else if (!args.adminId || !args.newPassword  || args.newPassword.length < 6|| !args.oldPassword) throw errorHandler('Missing Info', 'BAD_USER_INPUT', args)

            const admin = await adminRepository.findOne({ where: { adminId: args.adminId } });
            if (!admin) throw errorHandler('Admin Not Found', 'NOT_FOUND')
            else {
                const match = await compare(args.oldPassword, admin.password)
                if (!match) throw errorHandler('Invalid Details', 'BAD_USER_INPUT', args)

                const hashedPassword = await hash(args.newPassword, 7)
                admin.password = hashedPassword
                return await adminRepository.save(admin)
            }
        },
        deleteAdmin: async (_: null, args: { adminId: string }, context: Context) => {
            if (context.superAdmin) {
                await adminRepository.delete({ adminId: args.adminId })
                return 'Admin deleted'
            }
            throw errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
        createAuthor: async (_: null, args: {
            createUserInput: {
                username: string,
                email: string,
                password: string
            }
        }) => {
            console.log(args)
            if (!args.createUserInput.email || !args.createUserInput.password || args.createUserInput.password.length < 6 || args.createUserInput.username.length < 4 || !args.createUserInput.username) throw errorHandler('Missing Info','BAD_USER_INPUT')

            const userWithUsername = await userRepository.findOne({ where: { username: args.createUserInput.username } })
            if (userWithUsername) throw errorHandler('Username not unique','BAD_USER_INPUT',args.createUserInput.username)
            const authorWithUsername = await authorRepository.findOne({ where: { username: args.createUserInput.username } })
            if (authorWithUsername) throw errorHandler('Username not unique','BAD_USER_INPUT',args.createUserInput.username)

            const mailExists = await mailRepository.findOne({ where: { mail: args.createUserInput.email } })
            if (mailExists) throw errorHandler('Mail already in use', 'BAD_USER_INPUT')
            const hashedPassword = await hash(args.createUserInput.password, 7)//PASSWORD_HASH_SALT);
            const author = await authorRepository.save(authorRepository.create({ username: args.createUserInput.username, email: args.createUserInput.email, password: hashedPassword, books: [] }))
            await mailRepository.save(mailRepository.create({ mail: args.createUserInput.email }))
            console.log(author)
            return author
        },
        createUser: async (_: null, args: { createUserInput: { username: string, email: string, password: string } }) => {
            const username = args.createUserInput.username
            const email = args.createUserInput.email
            const password = args.createUserInput.password
            if (!email || !password || username.length < 4 || password.length < 6|| !username) throw errorHandler('Missing Info','BAD_USER_INPUT',args)
                

            const userWithUsername = await userRepository.findOne({ where: { username: username } })
            if (userWithUsername) throw errorHandler('Username not unique','BAD_USER_INPUT',args.createUserInput.username)
            const authorWithUsername = await authorRepository.findOne({ where: { username: username } })
            if (authorWithUsername) throw errorHandler('Username not unique','BAD_USER_INPUT',args.createUserInput.username)
            const mailExists = await mailRepository.findOne({ where: { mail: args.createUserInput.email } })
            if (mailExists) throw errorHandler('Mail already in use', 'BAD_USER_INPUT')
            const library = new Library()
            library.libraryBooks = []
            console.log(library)
            const hashedPassword = await hash(password, 7);
            const user = await userRepository.save(userRepository.create({ username: username, email: email, password: hashedPassword, library: library }))
            console.log(user)
            await mailRepository.save(mailRepository.create({ mail: args.createUserInput.email }))
            return user
        },
        createBook: async (_: null, args: { createBookInput: { name: string, summary: string, tagIds: string[] } }, context: Context) => {
            const name = args.createBookInput.name
            const summary = args.createBookInput.summary
            const tagIds = args.createBookInput.tagIds
            if (!context.author) {
                throw errorHandler('Unauthorized','UNAUTHORIZED')
            }
            const uniqueTagIds = Array.from(new Set(tagIds))
            if (!name || name.length < 4 || !summary)throw  errorHandler('Book name must be atleast 4 characters long and must contain a summary', 'BAD_USER_INPUT')
            const tags = await Promise.all(uniqueTagIds.map(tagId => tagRepository.findOne({ where: { tagId: tagId } })))
            const cleanedTags = tags.filter(tag => tag !== null)
            if(cleanedTags.length < 1) throw errorHandler('Books must have a minimum of 1 valid tag', 'BAD_USER_INPUT')
            const book = await bookRepository.save(bookRepository.create({ name: name, summary: summary, tags: cleanedTags, author: context.author }))
            console.log(book)
            return book
        },
        createTag: async (_: null, args: { tagName: string }, context: Context) => {
            if (!context.admin && !context.superAdmin) throw errorHandler('Unauthorized', 'UNAUTHORIZED')

            const tagName = args.tagName.toLocaleLowerCase()
            const existingTag = await tagRepository.findOne({ where: { name: tagName } })
            if (!existingTag) {
                return await tagRepository.save(tagRepository.create({ name: tagName }))
            }
            throw errorHandler('Tag already exists', 'FORBIDDDEN')
        },
        addChapter: async (_: null, args: { addChapterInput: { number: number, title: string, content: string, bookId: string, paywall: boolean } }, context: Context) => {
            const number = args.addChapterInput.number
            const bookId = args.addChapterInput.bookId
            const content = args.addChapterInput.content
            const paywall = args.addChapterInput.paywall
            const title = args.addChapterInput.title
            if (!context.author) {
                throw errorHandler('Unauthorized', 'UNAUTHORIZED')
            }
            const book = await bookRepository.findOne({ where: { bookId: bookId } })
            if (!book) {
                throw errorHandler('Book with bookId provided not found','BAD_USER_INPUT')
            }
            if (book.author.authorId !== context.author.authorId) {
                throw errorHandler('Unauthorized','UNAUTHORIZED')
            }
            const chapter = await chapterRepository.save(chapterRepository.create({ number: number, title: title, content: content, paywall: paywall, book: book }))
            return chapter
        },
        deleteChapter: async (_: null, args: { chapterId: string }, context: Context) => {
            if (!context.author) {
                throw errorHandler('Unauthorized','UNAUTHORIZED')
            }
            const chapter = await chapterRepository.findOne({ where: { chapterId: args.chapterId } })
            if (!chapter) throw errorHandler('No chapter associated with chapterId', 'BAD_USER_INPUT')
            if (chapter?.book.author.authorId !== context.author.authorId) throw errorHandler('Unauthorized', 'UNAUTHORIZED');

            await chapterRepository.delete({ chapterId: args.chapterId })
            return 'chapter deleted successfully'
        },
        addBookToLibrary: async (_: null, args: { bookId: string }, context: Context) => {
            if (!context.user) throw errorHandler('Unauthorized', 'UNAUTHORIZED');

            const book = await bookRepository.findOne({ where: { bookId: args.bookId } })
            if (!book) throw errorHandler('No book associated with bookId', 'BAD_USER_INPUT')

            const libraryBook = await libraryBookRepository.save(libraryBookRepository.create({ bookId: args.bookId, library: context.user?.library }))
            return await libraryBookRepository.save(libraryBook)
        },
        deleteBookFromLibrary: async (_: null, args: { libraryBookId: string }, context: Context) => {
            if (context.user) {
                await libraryBookRepository.delete({ libraryBookId: args.libraryBookId, library: context.user.library })
                const library = await libraryRepository.findOne({ where: { libraryId: context.user.library.libraryId } })
                return library
            }
            throw errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
        updateLibraryBookPaidChapters: async (_: null, args: { libraryBookId: string, newPaidChapterId: string }, context: Context) => {
            if (context.user) {
                const libraryBook = await libraryBookRepository.findOne({ where: { libraryBookId: args.libraryBookId, library: context.user.library } });
                if (libraryBook) {
                    const paidChapter = await paidChapterRepo.save(paidChapterRepo.create({ chapterId: args.newPaidChapterId, libraryBook: libraryBook }));
                    const allPaidChapters = libraryBook.paidChapters.concat(paidChapter);
                    libraryBook.paidChapters = allPaidChapters
                    await paidChapterRepo.save(paidChapter)
                    await libraryBookRepository.save(libraryBook);
                }
                throw errorHandler('Book not in library', 'FORBIDDEN')
            }
            throw errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
        addReview: async (_: null, args: { reviewInput: { rating: number, bookId: string } }, context: Context) => {
            if (context.user) {
                const book = await bookRepository.findOne({ where: { bookId: args.reviewInput.bookId } })
                if (book) {
                    const existingReview = await reviewRepository.findOne({ where: { user: context.user, book: book } })
                    if (!existingReview) return await reviewRepository.save(reviewRepository.create({ rating: args.reviewInput.rating, book: book, user: context.user }))
                    throw errorHandler('Review For Book Already Exists', 'FORBIDDEN')
                }
                throw errorHandler('Book Not found', 'NOT_FOUND')
            }
            throw errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
        editReview: async (_: null, args: { reviewId: string, reviewInput: { rating: number, bookId: string } }, context: Context) => {
            if (context.user) {
                const book = await bookRepository.findOne({ where: { bookId: args.reviewInput.bookId } })
                const review = await reviewRepository.findOne({ where: { reviewId: args.reviewId, user: context.user } });
                if (book && review) {
                    return reviewRepository.update({ reviewId: args.reviewId }, { rating: args.reviewInput.rating })
                }
               throw  errorHandler('Book or Review Not Found', 'NOT_FOUND')
            }
           throw  errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
        deleteReview: async (_: null, args: { reviewId: string }, context: Context) => {
            if (context.user) {
                return await reviewRepository.delete({ reviewId: args.reviewId, user: context.user })
            }
            throw errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
        addComment: async (_: null, args: { commentInput: { content: string, bookId: string } }, context: Context) => {
            if (context.user) {
                const book = await bookRepository.findOne({ where: { bookId: args.commentInput.bookId } })
                if (book) return await commentRepository.save(commentRepository.create({ content: args.commentInput.content, user: context.user, book: book }))
                throw errorHandler('Book Not Found', 'NOT_FOUND')
            }
           throw errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
        editComment: async (_: null, args: { commentId: string, content: string }, context: Context) => {
            if (context.user) {
                const comment = await commentRepository.findOne({ where: { user: context.user, commentId: args.commentId } })
                if (comment) {
                    return await commentRepository.update({ commentId: args.commentId }, { content: args.content, edited: true, dateModified: Date.now() })
                }
                throw errorHandler('Comment Not Found', 'NOT_FOUND')
            }
            throw errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
        deleteComment: async (_: null, args: { commentId: string }, context: Context) => {
            if (context.user) {
                await commentRepository.delete({ commentId: args.commentId, user: context.user })
            }
            throw errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
        addReply: async (_: null, args: { content: string, commentId: string }, context: Context) => {
            if (context.user) {
                const comment = await commentRepository.findOne({ where: { commentId: args.commentId } })
                if (comment) return await replyRepository.save(replyRepository.create({ content: args.content, user: context.user, comment: comment }))
                throw errorHandler('Book Not Found', 'NOT_FOUND')
            }
            throw errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
        deleteReply: async (_: null, args: { replyId: string }, context: Context) => {
            if (context.user) {
                await replyRepository.delete({ replyId: args.replyId, user: context.user })
            }
            throw errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
        addAuthorNote: async (_: null, args: { content: string, bookId: string }, context: Context) => {
            if (context.author) {
                const book = await bookRepository.findOne({ where: { bookId: args.bookId } })
                if (book) {
                    const authorNote = await authorNoteRepo.save(authorNoteRepo.create({ note: args.content }))
                    book.authorNotes = book.authorNotes.concat(authorNote)
                    await authorNoteRepo.save(authorNote)
                    await bookRepository.save(book)
                    return book
                }
                throw errorHandler('Book Not Found', 'NOT_FOUND')
            }
            throw errorHandler('Unauthorized', 'UNAUTHORIZED')
        },
    },

    // User: {
    //     library: (root: User) => {
    //         const library = 
    //     }
    // }
}