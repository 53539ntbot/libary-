const SUPABASE_URL = "https://rwzupiemmqpxxgrdpofu.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3enVwaWVtbXFweHhncmRwb2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NDM5OTEsImV4cCI6MjEwMTAxOTk5MX0.wb3nJr5DKCpnOHElfq73xqNTO3Mtj4T7_FX7Od0wWfA";


// สร้าง Supabase Client
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// โหลดข้อมูลเมื่อเปิดหน้าเว็บ
document.addEventListener("DOMContentLoaded", () => {
    fetchBooks();
});


// ==========================================
// บันทึกการยืมหนังสือ
// ==========================================

async function borrowBook() {

    const bookName = document.getElementById("bookName").value;
    const studentId = document.getElementById("studentId").value;
    const borrowDate = document.getElementById("borrowDate").value;
    const returnDate = document.getElementById("returnDate").value;

    if (!bookName || !studentId || !borrowDate || !returnDate) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
    }

    const { data, error } = await supabaseClient
        .from("borrows")
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

        console.error("Error inserting data:", error);
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");

    } else {

        alert("บันทึกการยืมสำเร็จ");

        fetchBooks();

        document.getElementById("bookName").value = "";
        document.getElementById("studentId").value = "";
        document.getElementById("borrowDate").value = "";
        document.getElementById("returnDate").value = "";
    }
}


// ==========================================
// ดึงข้อมูลมาแสดงในตาราง
// ==========================================

async function fetchBooks() {

    const { data, error } = await supabaseClient
        .from("borrows")
        .select("*")
        .order("id", { ascending: false });

    if (error) {

        console.error("Error fetching data:", error);
        alert("ไม่สามารถโหลดข้อมูลได้");

        return;
    }

    const bookTable = document.getElementById("bookTable");

    if (!bookTable) {
        console.error("ไม่พบ bookTable");
        return;
    }

    bookTable.innerHTML = "";

    let borrowingCount = 0;
    let returnedCount = 0;


    if (!data || data.length === 0) {

        bookTable.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    ยังไม่มีข้อมูลการยืมหนังสือ
                </td>
            </tr>
        `;

    } else {

        data.forEach((item, index) => {

            if (item.status === "กำลังยืม") {
                borrowingCount++;
            }

            if (item.status === "คืนแล้ว") {
                returnedCount++;
            }

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.book_name || "-"}</td>
                <td>${item.student_id || "-"}</td>

                <td>
                    ${
                        item.borrow_date
                            ? new Date(item.borrow_date)
                                .toLocaleString("th-TH")
                            : "-"
                    }
                </td>

                <td>
                    ${
                        item.return_date
                            ? new Date(item.return_date)
                                .toLocaleString("th-TH")
                            : "-"
                    }
                </td>

                <td>${item.status || "-"}</td>

                <td>
                    ${
                        item.status === "กำลังยืม"
                            ? `
                                <button onclick="returnBook('${item.id}')">
                                    คืนหนังสือ
                                </button>
                              `
                            : "คืนแล้ว"
                    }
                </td>
            `;

            bookTable.appendChild(row);
        });
    }


    // อัปเดตจำนวน
    const totalBorrow = document.getElementById("totalBorrow");
    const borrowingElement = document.getElementById("borrowingCount");
    const returnedElement = document.getElementById("returnedCount");

    if (totalBorrow) {
        totalBorrow.textContent = data.length;
    }

    if (borrowingElement) {
        borrowingElement.textContent = borrowingCount;
    }

    if (returnedElement) {
        returnedElement.textContent = returnedCount;
    }
}


// ==========================================
// คืนหนังสือ
// ==========================================

async function returnBook(id) {

    if (!confirm("ยืนยันการคืนหนังสือใช่หรือไม่?")) {
        return;
    }

    const { error } = await supabaseClient
        .from("borrows")
        .update({
            status: "คืนแล้ว"
        })
        .eq("id", id);

    if (error) {

        console.error("Error updating status:", error);
        alert("เกิดข้อผิดพลาดในการคืนหนังสือ");

    } else {

        alert("คืนหนังสือสำเร็จ");

        fetchBooks();
    }
}


// ==========================================
// ลบข้อมูลทั้งหมด
// ==========================================

async function deleteAll() {

    if (!confirm("คุณต้องการลบข้อมูลทั้งหมดใช่หรือไม่?")) {
        return;
    }

    const { error } = await supabaseClient
        .from("borrows")
        .delete()
        .neq("id", 0);

    if (error) {

        console.error("Error deleting data:", error);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");

    } else {

        alert("ลบข้อมูลทั้งหมดสำเร็จ");

        fetchBooks();
    }
}
