const SUPABASE_URL = "https://rwzupiemmqpxxgrdpofu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3enVwaWVtbXFweHhncmRwb2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NDM5OTEsImV4cCI6MjEwMTAxOTk5MX0.wb3nJr5DKCpnOHElfq73xqNTO3Mtj4T7_FX7Od0wWfA";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


async function borrowBook() {

  const bookName = document.getElementById("bookName").value;
  const studentId = document.getElementById("studentId").value;
  const borrowDate = document.getElementById("borrowDate").value;
  const returnDate = document.getElementById("returnDate").value;


  if (
    bookName === "" ||
    studentId === "" ||
    borrowDate === "" ||
    returnDate === ""
  ) {

    alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
    return;

  }


  const { data, error } = await supabaseClient
    .from("borrow_books")
    .insert([
      {
        book_name: bookName,
        student_id: studentId,
        borrow_date: borrowDate,
        return_date: returnDate,
        status: "กำลังยืม"
      }
    ]);


  if (error) {

    console.error(error);

    alert("เกิดข้อผิดพลาด: " + error.message);

    return;

  }


  alert("บันทึกการยืมหนังสือเรียบร้อย");


  document.getElementById("bookName").value = "";
  document.getElementById("studentId").value = "";
  document.getElementById("borrowDate").value = "";
  document.getElementById("returnDate").value = "";


  displayBooks();

}



async function displayBooks() {

  const table = document.getElementById("bookTable");


  table.innerHTML = `
    <tr>
      <td colspan="7">
        กำลังโหลดข้อมูล...
      </td>
    </tr>
  `;


  const { data, error } = await supabaseClient
    .from("borrow_books")
    .select("*")
    .order("id", {
      ascending: false
    });


  if (error) {

    console.error(error);

    table.innerHTML = `
      <tr>
        <td colspan="7">
          เกิดข้อผิดพลาดในการโหลดข้อมูล
        </td>
      </tr>
    `;

    return;

  }


  table.innerHTML = "";


  if (data.length === 0) {

    table.innerHTML = `
      <tr>
        <td colspan="7">
          ยังไม่มีข้อมูลการยืมหนังสือ
        </td>
      </tr>
    `;

    updateSummary([]);

    return;

  }


  data.forEach(function(book, index) {

    let statusHTML = "";


    if (book.status === "กำลังยืม") {

      statusHTML = `
        <span class="status-borrowing">
          กำลังยืม
        </span>
      `;

    } else {

      statusHTML = `
        <span class="status-returned">
          คืนแล้ว
        </span>
      `;

    }


    let actionButton = "";


    if (book.status === "กำลังยืม") {

      actionButton = `
        <button
          class="return-btn"
          onclick="returnBook(${book.id})"
        >
          คืนหนังสือ
        </button>
      `;

    } else {

      actionButton = `
        <span>คืนเรียบร้อย</span>
      `;

    }


    table.innerHTML += `

      <tr>

        <td>${index + 1}</td>

        <td>${book.book_name}</td>

        <td>${book.student_id}</td>

        <td>${formatDate(book.borrow_date)}</td>

        <td>${formatDate(book.return_date)}</td>

        <td>${statusHTML}</td>

        <td>

          ${actionButton}

          <button
            class="delete-btn"
            onclick="deleteBook(${book.id})"
          >
            ลบ
          </button>

        </td>

      </tr>

    `;

  });


  updateSummary(data);

}



async function returnBook(id) {

  const { error } = await supabaseClient
    .from("borrow_books")
    .update({
      status: "คืนแล้ว"
    })
    .eq("id", id);


  if (error) {

    console.error(error);

    alert("เกิดข้อผิดพลาด: " + error.message);

    return;

  }


  alert("คืนหนังสือเรียบร้อย");

  displayBooks();

}



async function deleteBook(id) {

  const confirmDelete = confirm(
    "คุณต้องการลบรายการนี้หรือไม่?"
  );


  if (!confirmDelete) {
    return;
  }


  const { error } = await supabaseClient
    .from("borrow_books")
    .delete()
    .eq("id", id);


  if (error) {

    console.error(error);

    alert("เกิดข้อผิดพลาด: " + error.message);

    return;

  }


  alert("ลบข้อมูลเรียบร้อย");

  displayBooks();

}



async function deleteAll() {

  const confirmDelete = confirm(
    "คุณต้องการลบข้อมูลทั้งหมดหรือไม่?"
  );


  if (!confirmDelete) {
    return;
  }


  const { error } = await supabaseClient
    .from("borrow_books")
    .delete()
    .neq("id", 0);


  if (error) {

    console.error(error);

    alert("เกิดข้อผิดพลาด: " + error.message);

    return;

  }


  alert("ลบข้อมูลทั้งหมดเรียบร้อย");

  displayBooks();

}



function updateSummary(data) {

  const total = data.length;


  const borrowing = data.filter(function(book) {

    return book.status === "กำลังยืม";

  }).length;


  const returned = data.filter(function(book) {

    return book.status === "คืนแล้ว";

  }).length;


  document.getElementById("totalBorrow").textContent = total;

  document.getElementById("borrowingCount").textContent = borrowing;

  document.getElementById("returnedCount").textContent = returned;

}



function formatDate(date) {

  if (!date) {
    return "-";
  }


  const newDate = new Date(date);


  return newDate.toLocaleString(
    "th-TH",
    {
      dateStyle: "short",
      timeStyle: "short"
    }
  );

}



displayBooks();