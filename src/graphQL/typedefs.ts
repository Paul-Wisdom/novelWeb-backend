export const typeDefs = `#graphql
    type Book {
        bookId: ID!
        name: String!
        summary: String!
        tags: [String]!
        author: Author!
        chapters: [Chapter!]!
        reviews: [Review!]!
        comments: [Comment!]!
        authorNotes: [AuthorNote!]!
        createdAt: String!
        status: String!
    }

    type Author {
        authorId: ID!
        username: String!
        books: [Book!]!
        joined: String!
        notifications: [UserNotification!]!
        
    }
    type AuthorNote {
        note: String!
        date: String!
    }

    type Chapter {
        chapterId: ID!
        title: String
        number: Int!
        content: String!
        book: Book!
        paywall: Boolean!
        updatedAt: String!
    }

    type Comment {
        commentId: ID!
        content: String!
        book: Book!
        user: User!
        replies: [Reply!]!
        dateModified: String!
    }

    type User {
        userId: ID!
        username: String!
        library: Library!
        joined: String!
        notifications: [AuthorNotification!]!
    }

    type Review {
        reviewId: ID!
        rating: Int!
        book: Book!
        user: User!
    }
    
    type Library {
        libraryId: String
        libraryBooks: [LibraryBook!]!
    }

    type LibraryBook {
        libraryBookId: ID!
        book: Book!
        currentChapter: Int!
        paidChapters: [Int!]!

    }

    type Token {
        value: String!
    }

    type Reply {
        replyId: String!
        comment: Comment!
        user: User!
        content: String!
        date: String!
    }

    type UserNotfification {
        notificationId: ID!
        content: String!
        title: String!
        date: String!
        user: User!
    }

    type AuthorNotfification {
        notificationId: ID!
        content: String!
        date: String!
        title: String!
        author: Author!
    }

    type Query {
        me: Author | User
        authors: [Author!]!
        author (username: String!): Author
        books (name: String): [Book!]!
        findBooksByTags (tag: String!): [Book!]!
        book (bookId: ID, name: String, authorName: String): Book
        user (username: String, id: ID): User
        chapter (chapterId: String!, bookId: String!): Chapter!
        chapterForLoggedInUsers (chapterId: String!, bookId: String!): Chapter!
        library (): Library
        review (bookId: String!): Review
        authorNotification (notificationId: String!): AuthorNotification
        userNotification (notificationId: String!): UserNotification
        
    }

    type Mutation {
        login (loginInput: LoginInput!): Token
        createAuthor (createUserInput: CreateUserInput!): Author
        createUser (createUserInput: CreateUserInput!): User
        createBook (createBookInput: CreateBookInput!): Book
        addChapter (addChapterInput: AddChapterInput): Book
        deleteChapter (chapterId: String!): String!
        addBookToLibrary (bookId: String!): LibraryBook
        deleteBookFromLibrary (libraryBookId: String): Library
        updateLibraryBookPaidChapters (libraryBookId: String!, newPaidChapters: [Int]!): LibraryBook
        addReview (reviewInput: ReviewInput!): Review
        editReview (reviewId: String!, reviewInput: ReviewInput!): Review
        deleteReview (reviewId: String!): Review
        addComment (commentInput: CommentInput!): Comment
        editComment (commentId: String!, content: String! ): Comment
        deleteComment (commentId: String!): Strings
        addReply (commentId: String!, content: String!): Reply!
        deleteReply (replyId: String!): String!
        addAuthorNote(content: String!, bookId: String!)

    }

    input CreateUserInput {
        username: String!
        email: String!
        password: String!
    }
    input LoginInput {
        email: String!
        password: String!
    }
    input CreateBookInput {
        name: String!
        summary: String!
        tags: [String!]!
    }
    input AddChapterInput {
        number: Int!
        title: String!
        content: String!
        bookId: String!
        paywall: Boolean!
    }
    input CommentInput {
        content: String!
        bookId: String!
    } 
    input ReviewInput {
        rating: Int!
        bookId: String!
    }
`;
//updateLibraryBookCurrentChapter (libraryBookId: String!, currentChapter: Int!): LibraryBook