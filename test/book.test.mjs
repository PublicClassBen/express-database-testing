process.env.NODE_ENV = "test";
import request from "supertest";
import {
  describe,
  it,
  beforeEach,
  afterAll,
  expect,
  afterEach,
  beforeAll,
} from "vitest";
import db from "../db.js"; // you’d need ESM-compatible exports here
import app from "../app.js";
let isbn;

beforeEach(async () => {
  let result = await db.query(
    `INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
        VALUES ('12345', 'https://www.amazon.com/Lord-Chaos-Book-Wheel-Time-ebook/dp/B003BQZ80M/ref=sr_1_1?crid=VEN78QKA8UPD&dib=eyJ2IjoiMSJ9.akLLVrZw7dQV20HwsyM5yICO3-gGVxmeTVMG3sURtGKIwQIbrE_SkVqw93FhO_bYn0O9Z8BRl0wEUVKND7Pw4A84EbVjgHMT097xPPTbw47Gv8NcLC8MVcao6lM7iCdT_fL31zqK6xFEjHUJqCeuWJj_usZkadvV0uPt1YXiyAz30RUsNkBlK3wgSmxPPCbEuELhOMmlNq_ajsl4m1ZJhL7E8phmDFoeHgjp0X3djYo.RTG6wr7xVRAuYvQWygN3_aCN4J7jZ6ITUnhoaoDBtcE&dib_tag=se&keywords=the+wheel+of+time+lord+of+chaos&qid=1762627917&sprefix=the+wheel+of+time+lord+of+cha%2Caps%2C906&sr=8-1',
        'Robert Jordan', 'English', 1049, 'Tor books', 'Lord of Chaos', 2010) RETURNING isbn`
  );
  isbn = result.rows[0].isbn;
});

describe("Bookstore API GET Tests", () => {
  it("GET all books", async () => {
    let res = await request(app).get("/books");
    const books = res.body.books;
    expect(books.length).toBe(1);
    expect(books[0].isbn).toBe("12345");
  });
  it("GET book by isnb", async () => {
    let res = await request(app).get("/books/12345");
    const book = res.body.book;
    expect(res.status).toBe(200);
    expect(book.isbn).toBe("12345");
  });

  it("GET two books", async () => {
    //insert
    let res = await request(app).post("/books").send({
      isbn: "7890",
      amazon_url:
        "https://www.amazon.com/Crown-Swords-Book-Seven-Wheel-ebook/dp/B003H4I5G2/ref=sr_1_2?crid=1B63DEXPCLTJN&dib=eyJ2IjoiMSJ9.ydd6pa1mscax-aHYvgwmyLjbFR33dkB5UqvvyazJV_pWmWmHRvx2dZOhd21hn8rIaxue__qBPaKK6jHiyv9bxBs0ehrGXEzvW6lJQ1JCSlLRYE20dJKQ0d-gMgRWzJAFRPSEMj5rWMA8zk54t6_vRAKpfi_Tpz6lu-MEI_Deg2uVx-Z2_FoFGDm_Ooy3VrE_ohJPlmHSQv3bgqwOauCNuec1tx6uDaTqCkMxbw6ShAY.Nkg8RTcS0kfPbJnpLo4M0VCK1eMv2VL2Oov9a00CZaY&dib_tag=se&keywords=the+wheel+of+time+book+7&qid=1762636014&sprefix=the+wheel+of+time+book+7%2Caps%2C336&sr=8-2",
      author: "Robert Jordan",
      language: "English",
      pages: 902,
      publisher: "Tor books",
      title: "A Crown of Swords",
      year: 2010,
    });
    //test
    let res2 = await request(app).get("/books");
    const books = res2.body.books;
    expect(books.length).toBe(2);
    expect(books[0].isbn).toBe("7890");
    expect(books[1].isbn).toBe("12345");
  });
});

describe("Bookstore API POST Tests", () => {
  it("POST a new book", async () => {
    let res = await request(app).post("/books").send({
      isbn: "7890",
      amazon_url:
        "https://www.amazon.com/Crown-Swords-Book-Seven-Wheel-ebook/dp/B003H4I5G2/ref=sr_1_2?crid=1B63DEXPCLTJN&dib=eyJ2IjoiMSJ9.ydd6pa1mscax-aHYvgwmyLjbFR33dkB5UqvvyazJV_pWmWmHRvx2dZOhd21hn8rIaxue__qBPaKK6jHiyv9bxBs0ehrGXEzvW6lJQ1JCSlLRYE20dJKQ0d-gMgRWzJAFRPSEMj5rWMA8zk54t6_vRAKpfi_Tpz6lu-MEI_Deg2uVx-Z2_FoFGDm_Ooy3VrE_ohJPlmHSQv3bgqwOauCNuec1tx6uDaTqCkMxbw6ShAY.Nkg8RTcS0kfPbJnpLo4M0VCK1eMv2VL2Oov9a00CZaY&dib_tag=se&keywords=the+wheel+of+time+book+7&qid=1762636014&sprefix=the+wheel+of+time+book+7%2Caps%2C336&sr=8-2",
      author: "Robert Jordan",
      language: "English",
      pages: 902,
      publisher: "Tor books",
      title: "A Crown of Swords",
      year: 2010,
    });
    const book = res.body.book;
    expect(res.status).toBe(201);
    expect(book.isbn).toBe("7890");
  });

  it("POST a book with incomplete data", async () => {
    let res = await request(app).post("/books").send({
      publisher: "Tor books",
      title: "A Crown of Swords",
      year: 2010,
    });
    const book = res.body.book;
    expect(res.status).toBe(500);
  });
});

describe("Bookstore API PUT Tests", () => {
  it("PUT existing book", async () => {
    let res = await request(app).put("/books/12345").send({
      pages: 10000,
    });
    const book = res.body.book;
    expect(res.status).toBe(200);
    expect(book.pages).toBe(10000);
  });
  it("PUT a book that does not exist", async () => {
    let res = await request(app).put("/books/4398573948573").send({
      pages: 10000,
    });
    expect(res.status).toBe(404);
  });
});

describe("Bookstore API DELETE Tests", () => {
  it("DELETE existing book", async () => {
    let res = await request(app).delete("/books/12345");
    const msg = res.body.message;
    expect(res.status).toBe(200);
    expect(msg).toBe("Book deleted");
  });
  it("DELETE a book that does not exist", async () => {
    let res = await request(app).delete("/books/9873294872394");
    const msg = res.body.message;
    expect(res.status).toBe(404);
  });
});

describe("Bookstore API Invalid Routes Tests", () => {
  it("DELETE existing book", async () => {
    let res = await request(app).delete("/doesNotExist");
    expect(res.status).toBe(404);
  });
});

afterEach(async function () {
  await db.query(`DELETE FROM "books"`);
});

afterAll(async function () {
  await db.end();
});
