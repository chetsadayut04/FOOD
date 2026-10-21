// ดึงรายชื่อวัตถุดิบทั้งหมดที่ไม่ใช่เครื่องปรุงพื้นฐาน
const allIngredients = [
  ...new Set(menus.flatMap(m => m.need.flatMap(n => n.split("|")).filter(n => !basics.includes(n))))
];

// สถานะ (State) ของแอปพลิเคชัน
let selected = new Set(JSON.parse(localStorage.getItem("ingredients-v1") || "[]"));
let methods = new Set();
let picked = null;

// ฟังก์ชัน Escape อักขระพิเศษเพื่อป้องกัน XSS
const esc = s => s.replace(/[&<>"']/g, c => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[c]));

// ตรวจสอบวัตถุดิบที่ขาดสำหรับแต่ละเมนู
function matching(m) {
  const missing = m.need.filter(item => !item.split("|").some(x => basics.includes(x) || selected.has(x)));
  return { m, missing };
}

// แสดงรายการวัตถุดิบให้เลือกตามหมวดหมู่และการค้นหา
function renderIngredients() {
  const searchInput = document.querySelector("#search");
  const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const container = document.querySelector("#ingredients");

  if (container) {
    container.innerHTML = Object.entries(groups).map(([group, items]) => {
      const visible = items.filter(x => allIngredients.includes(x) && x.toLowerCase().includes(q));
      return visible.length ? `
        <div class="group">
          <h3>${group}</h3>
          <div class="chips">
            ${visible.map(x => `
              <button class="chip" aria-pressed="${selected.has(x)}" data-ingredient="${esc(x)}">
                ${esc(x)}
              </button>
            `).join("")}
          </div>
        </div>
      ` : "";
    }).join("");

    // ผูก Event ให้แต่ละชิปวัตถุดิบ
    container.querySelectorAll("[data-ingredient]").forEach(b => {
      b.onclick = () => {
        const x = b.dataset.ingredient;
        if (selected.has(x)) {
          selected.delete(x);
        } else {
          selected.add(x);
        }
        localStorage.setItem("ingredients-v1", JSON.stringify([...selected]));
        render();
      };
    });
  }

  const selectedCountEl = document.querySelector("#selectedCount");
  if (selectedCountEl) {
    selectedCountEl.textContent = `เลือก ${selected.size} อย่าง`;
  }
}

// เรนเดอร์หน้าจอผลลัพธ์ทั้งหมด
function render() {
  renderIngredients();

  // ตัวกรองวิธีทำอาหาร
  const filtersContainer = document.querySelector("#filters");
  if (filtersContainer) {
    filtersContainer.innerHTML = ["ต้ม", "ทอด", "ย่าง"].map(x => `
      <button class="filter" aria-pressed="${methods.has(x)}" data-method="${x}">${x}</button>
    `).join("");

    filtersContainer.querySelectorAll("[data-method]").forEach(b => {
      b.onclick = () => {
        const x = b.dataset.method;
        if (methods.has(x)) {
          methods.delete(x);
        } else {
          methods.add(x);
        }
        render();
      };
    });
  }

  // คำนวณเมนูที่ทำได้และเมนูที่ขาดวัตถุดิบ
  const rows = menus.map(matching).filter(x => !methods.size || x.m.methods.some(y => methods.has(y)));
  const ready = rows.filter(x => x.missing.length === 0);
  const close = rows.filter(x => x.missing.length > 0 && x.missing.length <= 2);

  const readyCountEl = document.querySelector("#readyCount");
  const closeCountEl = document.querySelector("#closeCount");
  if (readyCountEl) readyCountEl.textContent = `${ready.length} เมนู`;
  if (closeCountEl) closeCountEl.textContent = `${close.length} เมนู`;

  const card = x => `
    <article class="dish ${picked === x.m.name ? "picked" : ""}">
      <div class="dish-top">
        <h3>${esc(x.m.name)}</h3>
        <span class="methods">${x.m.methods.join(" · ")}</span>
      </div>
      ${x.missing.length ? `<p class="missing">ขาด: ${x.missing.map(esc).join(", ")}</p>` : ""}
    </article>
  `;

  const readyEl = document.querySelector("#ready");
  const closeEl = document.querySelector("#close");

  if (readyEl) {
    readyEl.innerHTML = ready.length
      ? ready.map(card).join("")
      : '<div class="empty">ยังไม่มีเมนูที่วัตถุดิบครบ</div>';
  }

  if (closeEl) {
    closeEl.innerHTML = close.length
      ? close.map(card).join("")
      : '<div class="empty">ไม่มีเมนูที่ขาดอีกนิดเดียว</div>';
  }
}

// กำหนดการทำงานของปุ่มต่าง ๆ เมื่อหน้าเว็บโหลดเสร็จ
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector("#search");
  const clearBtn = document.querySelector("#clear");
  const randomBtn = document.querySelector("#random");

  if (searchInput) {
    searchInput.addEventListener("input", renderIngredients);
  }

  // ปุ่มล้างรายการที่เลือก
  if (clearBtn) {
    clearBtn.onclick = () => {
      selected.clear();
      localStorage.removeItem("ingredients-v1");
      render();
    };
  }

  // ปุ่มสุ่มเมนู
  if (randomBtn) {
    randomBtn.onclick = () => {
      const available = menus.map(matching).filter(x => !methods.size || x.m.methods.some(y => methods.has(y)));
      const ready = available.filter(x => x.missing.length === 0);
      const pool = selected.size ? ready : available;
      if (!pool.length) {
        alert("ทำได้เลยยังไม่มีเมนู ลองเลือกวัตถุดิบเพิ่ม");
        return;
      }
      picked = pool[Math.floor(Math.random() * pool.length)].m.name;
      render();
      document.querySelector(".picked")?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
  }

  // สลับแท็บระหว่าง ตารางอาหาร 7 วัน และ วัตถุดิบ
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      const targetContent = document.getElementById(btn.dataset.tab);
      if (targetContent) targetContent.classList.add("active");
    };
  });

  // เริ่มต้นแสดงผล
  render();
});

