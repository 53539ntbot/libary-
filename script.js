const SUPABASE_URL = "https://rwzupiemmqpxxgrdpofu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3enVwaWVtbXFweHhncmRwb2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NDM5OTEsImV4cCI6MjEwMTAxOTk5MX0.wb3nJr5DKCpnOHElfq73xqNTO3Mtj4T7_FX7Od0wWfA";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// โหลดข้อมูลเมื่อเปิดหน้าเว็บ
document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();
});

// 2. ฟังก์ชันบันทึกการยืมหนังสือ
async function borrowBook() {
    const bookName = document.getElementById('bookName').value;
    const studentId = document.getElementById('studentId').value;
    const borrowDate = document.getElementById('borrowDate').value;
    const returnDate = document.getElementById('returnDate').value;

    if (!bookName || !studentId || !borrowDate || !returnDate) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }

    const { data, error } = await supabase
        .from('borrows') // ชื่อตารางใน Supabase
        .insert([
            {
                book_name: bookName,
                student_id: studentId,
                borrow_date: borrowDate,
                return_date: returnDate,
                status: 'กำลังยืม'
            }
        ]);

    if (error) {
        console.error('Error inserting data:', error);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } else {
        alert('บันทึกการยืมสำเร็จ');
        fetchBooks(); // โหลดตารางใหม่
    }
}

// 3. ฟังก์ชัน ดึงข้อมูลมาแสดงในตาราง
async function fetchBooks() {
    const { data, error } = await supabase
        .from('borrows')
        .select('*');

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    const bookTable = document.getElementById('bookTable');
    bookTable.innerHTML = '';

    let borrowingCount = 0;
    let returnedCount = 0;

    data.forEach((item, index) => {
        if (item.status === 'กำลังยืม') borrowingCount++;
        if (item.status === 'คืนแล้ว') returnedCount++;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.book_name}</td>
            <td>${item.student_id}</td>
            <td>${new Date(item.borrow_date).toLocaleString('th-TH')}</td>
            <td>${new Date(item.return_date).toLocaleString('th-TH')}</td>
            <td>${item.status}</td>
            <td>
                <button onclick="returnBook('${item.id}')">คืนหนังสือ</button>
            </td>
        `;
        bookTable.appendChild(row);
    });

    // อัปเดตตัวเลขสรุป
    document.getElementById('totalBorrow').textContent = data.length;
    document.getElementById('borrowingCount').textContent = borrowingCount;
    document.getElementById('returnedCount').textContent = returnedCount;
}

// 4. ฟังก์ชัน คืนหนังสือ
async function returnBook(id) {
    const { error } = await supabase
        .from('borrows')
        .update({ status: 'คืนแล้ว' })
        .eq('id', id);

    if (error) {
        console.error('Error updating status:', error);
    } else {
        fetchBooks();
    }
}

// 5. ฟังก์ชัน ลบข้อมูลทั้งหมด
async function deleteAll() {
    if (!confirm('คุณต้องการลบข้อมูลทั้งหมดใช่หรือไม่?')) return;

    const { error } = await supabase
        .from('borrows')
        .delete()
        .neq('id', 0); // ลบทุก row

    if (error) {
        console.error('Error deleting data:', error);
    } else {
        fetchBooks();
    }
}
displayBooks();
