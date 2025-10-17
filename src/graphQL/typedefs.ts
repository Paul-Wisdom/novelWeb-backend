export const typeDefs = `#graphql

    scalar Upload

    type File {
        url: String!,
        publicId: String!
    }
    type Book {
        bookId: ID!
        name: String!
        summary: String!
        tags: [Tag]!
        author: Author!
        chapters: [Chapter!]!
        reviews: [Review!]!
        comments: [Comment!]!
        authorNotes: [AuthorNote!]!
        createdAt: String!
        status: String!
        photoUrl: String
    }

    type Tag {
        tagId: ID!
        name: String!
        books: [Book!]!
    }

    type Author {
        authorId: ID!
        username: String!
        books: [Book!]!
        joined: String!
        profilePhotoUrl: String
        notifications: [AuthorNotification!]!
        
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
        profilePhotoUrl: String
        notifications: [UserNotification!]!
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

    type UserNotification {
        notificationId: ID!
        content: String!
        title: String!
        date: String!
        user: User!
    }

    type AuthorNotification {
        notificationId: ID!
        content: String!
        date: String!
        title: String!
        author: Author!
    }

    type Admin {
        adminId: ID!
        username: String!
        email: String!
    }
    union CombinedUser = Author | User | Admin

    type Query {
        me: CombinedUser!
        authors: [Author!]!
        author (username: String!): Author
        books (name: String): [Book!]!
        tags: [Tag!]!
        findBooksByTags (tagIds: [String!]!): [Book!]!
        book (bookId: ID, name: String, authorName: String): Book
        user (username: String, id: ID): User
        chapter (chapterId: String!, bookId: String!): Chapter!
        chapterForLoggedInUsers (chapterId: String!, bookId: String!): Chapter!
        library: Library
        review (bookId: String!): Review
        authorNotification (notificationId: String!): AuthorNotification
        userNotification (notificationId: String!): UserNotification
        
    }

    type Mutation {
        login (loginInput: LoginInput!): Token
        adminLogin (loginInput: LoginInput!): Token
        createAuthor (createUserInput: CreateUserInput!): Author
        createUser (createUserInput: CreateUserInput!): User
        createAdmin (email: String!, username: String!): Admin!
        createBook (createBookInput: CreateBookInput!): Book
        createTag (tagName: String!): Tag
        addChapter (addChapterInput: AddChapterInput): Book
        deleteChapter (chapterId: String!): String!
        addBookToLibrary (bookId: String!): LibraryBook
        deleteBookFromLibrary (libraryBookId: String): Library
        updateLibraryBookPaidChapters (libraryBookId: String!, newPaidChapterId: String!): LibraryBook
        addReview (reviewInput: ReviewInput!): Review
        editReview (reviewId: String!, reviewInput: ReviewInput!): Review
        deleteReview (reviewId: String!): Review
        addComment (commentInput: CommentInput!): Comment
        editComment (commentId: String!, content: String! ): Comment
        deleteComment (commentId: String!): String
        addReply (commentId: String!, content: String!): Reply!
        deleteReply (replyId: String!): String!
        addAuthorNote(content: String!, bookId: String!): Book!
        deleteAdmin (adminId: String!): String!
        changeAdminPassword(adminId: String!, oldPassword: String!, newPassword: String!): Admin!
        uploadUserProfileImage(file: Upload!): File!
        uploadBookImage(file: Upload!, bookId: String!): File!
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
        tagIds: [String!]!
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