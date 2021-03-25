process.env.NODE_ENV = "test";
const request = require("supertest");
const Book = require("../models/book");
const app = require("../app");
const db = require("../db");
const { user } = require("../db");

let testBook1;
let testBook2;

// beforeEach(async () => {
//     const result = await db.query(
//         `INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
//         VALUES (0691161518, "http://a.co/eobPtX2", "Matthew Lane", "English", 264, "Princeton", "Power-Up", 2017)
//         RETURNING isbn, amazon_url, author, language, pages, publisher, title, year`)

//         testBook = result.rows[0]
// })

beforeEach(async () => {
    testBook1 = await Book.create({
        isbn: "0691161518", 
        amazon_url: "http://a.co/eobPtX2",
        author: "Matthew Lane", 
        language: "English", 
        pages: 264, 
        publisher: "Princeton", 
        title: "Power-Up", 
        year: 2017
    }),
    testBook2 = await Book.create({
        isbn: "0000161518", 
        amazon_url: "http://a.co/eobGtX2",
        author: "JK Rowling", 
        language: "English", 
        pages: 800, 
        publisher: "Penguin", 
        title: "Harry Potter", 
        year: 2003
    })
})

afterEach(async () => {
    await db.query(`DELETE FROM books`)
})

afterAll(async () => {
    await db.end()
})

describe("GET /books", () => {
    test("Gets list of all books", async () => {
        const res = await request(app).get('/books');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ books: [testBook2, testBook1] })
    })
})

describe("POST /books", () => {
    test("Creates a new book and responds with newly created book", async () => {
        const res = await request(app).post('/books').send({
            isbn: "0000000000", 
            amazon_url: "http://a.co/eobtX2",
            author: "JK Rowling", 
            language: "English", 
            pages: 800, 
            publisher: "Penguin", 
            title: "Harry Potter", 
            year: 2003
        });
        expect(res.body).toEqual({
            book: {
                isbn: expect.any(String),
                amazon_url: expect.any(String),
                author: "JK Rowling", 
                language: "English", 
                pages: expect.any(Number),
                publisher: "Penguin", 
                title: "Harry Potter", 
                year: expect.any(Number)
            }
        })
    })
})

describe("GET /books/:isbn", () => {
    test("Returns book based on ISBN number", async () => {
        const res = await request(app).get('/books/0691161518');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ book: testBook1 })
    })
    test("Respond with 404 for invalid isbn", async () => {
        const res = await request(app).get('/books/0999999999');
        expect(res.statusCode).toBe(404)
    })
})

describe("PUT /books/:isbn", () => {
    test("Updates a book and responds with updated book", async () => {
        const res = await request(app).put('/books/0691161518').send({
            amazon_url: "http://a.co/eobtX2",
            author: "JK Rowling", 
            language: "English", 
            pages: 800, 
            publisher: "Penguin", 
            title: "Harry Potter", 
            year: 2003
        });
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            book: {
                isbn: expect.any(String),
                amazon_url: expect.any(String),
                author: "JK Rowling", 
                language: "English", 
                pages: expect.any(Number),
                publisher: "Penguin", 
                title: "Harry Potter", 
                year: expect.any(Number)
            }
        })
        })
    test("Respond with 404 for invalid isbn", async () => {
        const res = await request(app).put('/books/99999999999').send({
            amazon_url: "http://a.co/eobtX2",
            author: "JK Rowling", 
            language: "English", 
            pages: 800, 
            publisher: "Penguin", 
            title: "Harry Potter", 
            year: 2003
        });
        expect(res.statusCode).toBe(404)
    })
})

describe("DELETE /books/:isbn", () => {
    test("Deletes a book and responds with 'Book Deleted'", async () => {
        const res = await request(app).delete(`/books/${testBook1.isbn}`);
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({ message: "Book deleted"})
    })
})