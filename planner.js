// ข้อมูลวันและมื้ออาหาร
const DAYS = [
  { id: "mon", label: "วันจันทร์", short: "จ." },
  { id: "tue", label: "วันอังคาร", short: "อ." },
  { id: "wed", label: "วันพุธ", short: "พ." },
  { id: "thu", label: "วันพฤหัสบดี", short: "พฤ." },
  { id: "fri", label: "วันศุกร์", short: "ศ." },
  { id: "sat", label: "วันเสาร์", short: "ส." },
  { id: "sun", label: "วันอาทิตย์", short: "อา." }
];

// มื้ออาหารทั้งหมด (รวมมื้อว่างบ่ายเพื่อบาลานซ์สารอาหาร)
const ALL_MEALS = [
  { id: "breakfast", label: "มื้อเช้า", icon: "🌅" },
  { id: "lunch", label: "มื้อกลางวัน", icon: "☀️" },
  { id: "snack", label: "มื้อว่างบ่าย", icon: "🥪", isSnack: true },
  { id: "dinner", label: "มื้อเย็น", icon: "🌙" }
];

// การตั้งค่าเปิด/ปิดมื้อว่าง
let includeSnack = JSON.parse(localStorage.getItem("include-snack-v1") ?? "true");

function getActiveMeals() {
  return includeSnack ? ALL_MEALS : ALL_MEALS.filter(m => !m.isSnack);
}

// โครงสร้างเริ่มต้นของตารางอาหาร 7 วัน
function createDefaultPlan() {
  const plan = {};
  DAYS.forEach(day => {
    plan[day.id] = {
      breakfast: null,
      lunch: null,
      snack: null,
      dinner: null
    };
  });
  return plan;
}

// โหลดข้อมูลตารางจาก LocalStorage
let currentPlan = JSON.parse(localStorage.getItem("mealplan-v1") || "null");
if (!currentPlan) {
  currentPlan = createDefaultPlan();
  // ตัวอย่างเริ่มต้น: 3 มื้อหลัก + 1 มื้อว่าง ที่สารอาหารลงตัวและอิ่มสบาย
  currentPlan.mon.breakfast = { name: "ต้มจืดไข่น้ำ", methods: ["ต้ม", "ทอด"], withRice: true, sideDish: null };
  currentPlan.mon.lunch = { name: "ข้าวราดผัดกะเพราหมู", methods: ["ทอด"], withRice: false, sideDish: null };
  currentPlan.mon.snack = { name: "กล้วยหอม", methods: ["สด"], withRice: false, sideDish: null };
  currentPlan.mon.dinner = { name: "ไก่ย่าง", methods: ["ย่าง"], withRice: true, sideDish: null };

  currentPlan.tue.breakfast = { name: "ข้าวผัดไข่", methods: ["ทอด"], withRice: false, sideDish: null };
  currentPlan.tue.lunch = { name: "ผัดซีอิ๊วหมู", methods: ["ทอด"], withRice: false, sideDish: null };
  currentPlan.tue.snack = { name: "นมถั่วเหลืองหวานน้อย", methods: ["ต้ม"], withRice: false, sideDish: null };
  currentPlan.tue.dinner = { name: "ปลาย่าง", methods: ["ย่าง"], withRice: true, sideDish: null };
}

// บันทึกลง LocalStorage
function savePlan() {
  localStorage.setItem("mealplan-v1", JSON.stringify(currentPlan));
}

// คำนวณสารอาหารของมื้ออาหาร (รวมข้าวสวยและเมนูเคียงถ้ามี)
function getMealNutrition(item) {
  if (!item) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const dish = menus.find(m => m.name === item.name);
  let cal = dish ? dish.calories : 0;
  let pro = dish ? dish.protein : 0;
  let carb = dish ? dish.carbs : 0;
  let fat = dish ? dish.fat : 0;

  // เพิ่มข้าวสวย
  if (item.withRice) {
    cal += RICE_SERVING.calories;
    pro += RICE_SERVING.protein;
    carb += RICE_SERVING.carbs;
    fat += RICE_SERVING.fat;
  }

  // เพิ่มเมนูเคียง
  if (item.sideDish) {
    const side = menus.find(m => m.name === item.sideDish);
    if (side) {
      cal += side.calories;
      pro += side.protein;
      carb += side.carbs;
      fat += side.fat;
    }
  }

  return { calories: cal, protein: pro, carbs: carb, fat };
}

// สลับการรับ/ไม่รับข้าวสวย
function toggleRice(e, dayId, mealId) {
  if (e) e.stopPropagation();
  if (currentPlan[dayId]?.[mealId]) {
    currentPlan[dayId][mealId].withRice = !currentPlan[dayId][mealId].withRice;
    savePlan();
    renderPlanner();
  }
}

// ลบเมนูออกจากมื้อ
function removeMeal(e, dayId, mealId) {
  if (e) e.stopPropagation();
  if (currentPlan[dayId]) {
    currentPlan[dayId][mealId] = null;
    savePlan();
    renderPlanner();
  }
}

// ล้างตารางทั้งหมด
function clearAllPlan() {
  if (confirm("ต้องการล้างตารางอาหารทั้งหมดใช่หรือไม่?")) {
    currentPlan = createDefaultPlan();
    savePlan();
    renderPlanner();
  }
}

// สลับโหมดเปิด/ปิดมื้อว่างบ่าย
function toggleSnackSetting() {
  includeSnack = !includeSnack;
  localStorage.setItem("include-snack-v1", JSON.stringify(includeSnack));
  updateSnackBtnUI();
  renderPlanner();
}

function updateSnackBtnUI() {
  const btn = document.querySelector("#toggleSnackBtn");
  if (btn) {
    if (includeSnack) {
      btn.classList.add("active");
      btn.textContent = "🥪 มื้อว่าง: เปิดอยู่ (4 มื้อ)";
    } else {
      btn.classList.remove("active");
      btn.textContent = "🥪 มื้อว่าง: ปิดอยู่ (3 มื้อ)";
    }
  }
}

// ==========================================
// เป้าหมายโภชนาการ (Nutrition Goals & Targets)
// ==========================================
let nutritionGoal = JSON.parse(localStorage.getItem("nutrition-goal-v1") || '{"calories": 1800, "protein": 80}');

function updateNutritionGoalUI() {
  const goalTextEl = document.querySelector("#currentGoalText");
  if (goalTextEl) {
    goalTextEl.textContent = `🔥 ${Number(nutritionGoal.calories).toLocaleString()} Kcal / วัน · 🥩 โปรตีน ${nutritionGoal.protein}g`;
  }

  const calInput = document.querySelector("#targetCaloriesInput");
  const proInput = document.querySelector("#targetProteinInput");
  if (calInput) calInput.value = nutritionGoal.calories;
  if (proInput) proInput.value = nutritionGoal.protein;
}

function openNutritionModal() {
  const modal = document.querySelector("#nutritionModal");
  updateNutritionGoalUI();
  if (modal) modal.style.display = "flex";
}

function closeNutritionModal() {
  const modal = document.querySelector("#nutritionModal");
  if (modal) modal.style.display = "none";
}

function saveNutritionGoal() {
  const calInput = document.querySelector("#targetCaloriesInput");
  const proInput = document.querySelector("#targetProteinInput");

  const calories = parseInt(calInput?.value || "1800", 10);
  const protein = parseInt(proInput?.value || "80", 10);

  nutritionGoal = { calories, protein };
  localStorage.setItem("nutrition-goal-v1", JSON.stringify(nutritionGoal));

  updateNutritionGoalUI();
  renderPlanner();
  closeNutritionModal();
}

// คำนวณ BMR & TDEE ด้วยสูตร Mifflin-St Jeor
function runBmrTdeeCalculation() {
  const gender = document.querySelector("#calcGender")?.value || "male";
  const age = parseFloat(document.querySelector("#calcAge")?.value || "25");
  const weight = parseFloat(document.querySelector("#calcWeight")?.value || "65");
  const height = parseFloat(document.querySelector("#calcHeight")?.value || "170");
  const activity = parseFloat(document.querySelector("#calcActivity")?.value || "1.375");
  const goal = document.querySelector("#calcGoal")?.value || "maintain";

  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr += (gender === "male" ? 5 : -161);

  const tdee = bmr * activity;

  let targetCal = tdee;
  let targetPro = weight * 1.4;

  if (goal === "cut") {
    targetCal = tdee * 0.85; // ลด 15%
    targetPro = weight * 1.8;
  } else if (goal === "bulk") {
    targetCal = tdee * 1.15; // เพิ่ม 15%
    targetPro = weight * 2.0;
  }

  const finalCal = Math.round(targetCal);
  const finalPro = Math.round(targetPro);

  const calInput = document.querySelector("#targetCaloriesInput");
  const proInput = document.querySelector("#targetProteinInput");
  if (calInput) calInput.value = finalCal;
  if (proInput) proInput.value = finalPro;
}

// ==========================================
// สุ่มจัดตารางอาหารอัจฉริยะ (Smart Auto-Plan พร้อมมื้อว่างบาลานซ์)
// ==========================================
function autoGeneratePlan() {
  const activeMeals = getActiveMeals();
  let hasExisting = false;

  DAYS.forEach(d => {
    activeMeals.forEach(m => {
      if (currentPlan[d.id]?.[m.id]) hasExisting = true;
    });
  });

  let onlyEmpty = false;
  if (hasExisting) {
    const totalSlots = DAYS.length * activeMeals.length;
    const overwriteAll = confirm(`ต้องการจัดตารางอาหารตามเป้าหมาย (${nutritionGoal.calories.toLocaleString()} Kcal/วัน):\n• กด [ตกลง / OK] เพื่อสุ่มใหม่ทั้งหมด ${totalSlots} มื้อ\n• กด [ยกเลิก / Cancel] เพื่อสุ่มเฉพาะช่องที่ยังว่างอยู่`);
    if (!overwriteAll) {
      onlyEmpty = true;
    }
  }

  const savedIngredients = new Set(JSON.parse(localStorage.getItem("ingredients-v1") || "[]"));
  const usedMenuNames = new Set();

  if (onlyEmpty) {
    DAYS.forEach(d => {
      activeMeals.forEach(m => {
        if (currentPlan[d.id]?.[m.id]) {
          usedMenuNames.add(currentPlan[d.id][m.id].name);
        }
      });
    });
  }

  // แยกกลุ่มเมนู
  const mainAndSinglePool = menus.filter(m => m.type !== "side" && m.type !== "snack");
  const snackPool = menus.filter(m => m.type === "snack");

  DAYS.forEach(day => {
    if (!currentPlan[day.id]) currentPlan[day.id] = {};

    const slots = activeMeals.map(m => m.id);
    const neededSlots = slots.filter(s => !onlyEmpty || !currentPlan[day.id][s]);

    if (!neededSlots.length) return;

    // คำนวณสัดส่วนพลังงานตามโมเดลโภชนาการ
    // ถ้ารวมมื้อว่าง: เช้า 25%, กลางวัน 35%, มื้อว่าง 15%, เย็น 25%
    // ถ้าไม่รวมมื้อว่าง: เช้า 28%, กลางวัน 38%, เย็น 34%
    const slotTargets = includeSnack ? {
      breakfast: nutritionGoal.calories * 0.25,
      lunch: nutritionGoal.calories * 0.35,
      snack: nutritionGoal.calories * 0.15,
      dinner: nutritionGoal.calories * 0.25
    } : {
      breakfast: nutritionGoal.calories * 0.28,
      lunch: nutritionGoal.calories * 0.38,
      dinner: nutritionGoal.calories * 0.34
    };

    neededSlots.forEach(slot => {
      const isSnackSlot = (slot === "snack");
      const targetCal = slotTargets[slot] || (nutritionGoal.calories / slots.length);

      if (isSnackSlot) {
        // เลือกของว่างสุขภาพ
        const availableSnacks = snackPool.filter(m => !usedMenuNames.has(m.name));
        const poolToUse = availableSnacks.length ? availableSnacks : snackPool;

        const scored = poolToUse.map(item => ({
          dish: item,
          withRice: false,
          score: Math.abs(item.calories - targetCal) + (Math.random() - 0.5) * 30
        }));

        scored.sort((a, b) => a.score - b.score);
        const pick = scored[0].dish;

        usedMenuNames.add(pick.name);
        currentPlan[day.id][slot] = {
          name: pick.name,
          methods: pick.methods,
          withRice: false,
          sideDish: null
        };
      } else {
        // เลือกมื้อหลัก (เช้า / กลางวัน / เย็น)
        const available = mainAndSinglePool.filter(m => !usedMenuNames.has(m.name));
        const poolToUse = available.length ? available : mainAndSinglePool;

        const scored = poolToUse.map(dish => {
          const withRice = (dish.type === "main");
          const mealCal = dish.calories + (withRice ? RICE_SERVING.calories : 0);
          const calDiff = Math.abs(mealCal - targetCal);
          const pantryBonus = dish.need.some(n => savedIngredients.has(n)) ? -60 : 0;
          const randomFactor = (Math.random() - 0.5) * 40;

          return {
            dish,
            withRice,
            score: calDiff + pantryBonus + randomFactor
          };
        });

        scored.sort((a, b) => a.score - b.score);
        const pick = scored[0];

        usedMenuNames.add(pick.dish.name);
        currentPlan[day.id][slot] = {
          name: pick.dish.name,
          methods: pick.dish.methods,
          withRice: pick.withRice,
          sideDish: null
        };
      }
    });

    // ปรับบาลานซ์พลังงานทั้งวัน (Daily Balancing)
    let currentDayCal = 0;
    slots.forEach(s => {
      currentDayCal += getMealNutrition(currentPlan[day.id][s]).calories;
    });

    const deficit = nutritionGoal.calories - currentDayCal;

    // ถ้าแคลอรียังขาดเกิน 80 kcal ให้เติมไข่ต้ม/ไข่ดาวเพื่อเพิ่มทั้งพลังงานและโปรตีน
    if (deficit >= 80) {
      const bestSide = (deficit >= 130) ? "ไข่ดาว" : "ไข่ต้มยางมะตูม";
      if (currentPlan[day.id].lunch) {
        currentPlan[day.id].lunch.sideDish = bestSide;
      } else if (currentPlan[day.id].breakfast) {
        currentPlan[day.id].breakfast.sideDish = bestSide;
      }
    }
  });

  savePlan();
  renderPlanner();
}

// ==========================================
// ระบบเลือกเมนูใส่ตาราง (Menu Picker Modal)
// ==========================================
let activePickerSlot = null; // { dayId, mealId }
let modalFilterType = "all"; // "all" | "single" | "main" | "snack" | "ต้ม" | "ทอด" | "ย่าง"

function openPicker(dayId, mealId) {
  activePickerSlot = { dayId, mealId };

  const dayObj = DAYS.find(d => d.id === dayId);
  const mealObj = ALL_MEALS.find(m => m.id === mealId);

  const titleEl = document.querySelector("#modalSlotTitle");
  const subtitleEl = document.querySelector("#modalSlotSubtitle");
  const modal = document.querySelector("#menuPickerModal");
  const searchInput = document.querySelector("#modalSearch");

  if (titleEl && dayObj && mealObj) {
    titleEl.textContent = `${dayObj.label} — ${mealObj.icon} ${mealObj.label}`;
  }
  if (subtitleEl) {
    const currentItem = currentPlan[dayId]?.[mealId];
    subtitleEl.textContent = currentItem 
      ? `เมนูปัจจุบัน: ${currentItem.name} (คลิกเมนูใหม่เพื่อเปลี่ยน)`
      : (mealObj?.isSnack ? "เลือกของว่างสุขภาพหรือเครื่องดื่มเพื่อเติมพลังงาน" : "เลือกเมนูที่ต้องการเพื่อใส่ลงในมื้อนี้");
  }

  if (searchInput) searchInput.value = "";
  // ถ้าคลิกมื้อว่าง ให้เปิดหมวดของว่างเป็นค่าเริ่มต้น
  modalFilterType = mealObj?.isSnack ? "snack" : "all";

  renderModalFilters();
  renderModalMenuList();

  if (modal) {
    modal.style.display = "flex";
    if (searchInput) searchInput.focus();
  }
}

function closePicker() {
  const modal = document.querySelector("#menuPickerModal");
  if (modal) {
    modal.style.display = "none";
  }
  activePickerSlot = null;
}

function selectMenu(menuName) {
  if (!activePickerSlot) return;

  const found = menus.find(m => m.name === menuName);
  if (found) {
    const { dayId, mealId } = activePickerSlot;
    if (!currentPlan[dayId]) currentPlan[dayId] = {};
    const withRice = (found.type === "main");
    currentPlan[dayId][mealId] = {
      name: found.name,
      methods: found.methods,
      withRice: withRice,
      sideDish: null
    };
    savePlan();
    renderPlanner();
    closePicker();
  }
}

function renderModalFilters() {
  const container = document.querySelector("#modalFilters");
  if (!container) return;

  const filters = [
    { id: "all", label: "ทั้งหมด" },
    { id: "single", label: "จานเดียว" },
    { id: "main", label: "กับข้าว" },
    { id: "snack", label: "🥪 ของว่าง/ผลไม้" },
    { id: "ต้ม", label: "ต้ม" },
    { id: "ทอด", label: "ทอด" },
    { id: "ย่าง", label: "ย่าง" }
  ];

  container.innerHTML = filters.map(f => `
    <button class="filter" aria-pressed="${modalFilterType === f.id}" data-filter-type="${f.id}">
      ${f.label}
    </button>
  `).join("");

  container.querySelectorAll("[data-filter-type]").forEach(btn => {
    btn.onclick = () => {
      modalFilterType = btn.dataset.filterType;
      renderModalFilters();
      renderModalMenuList();
    };
  });
}

function renderModalMenuList() {
  const container = document.querySelector("#modalMenuList");
  const searchInput = document.querySelector("#modalSearch");
  if (!container) return;

  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

  const filtered = menus.filter(m => {
    const matchQuery = !query || 
      m.name.toLowerCase().includes(query) || 
      m.need.some(n => n.toLowerCase().includes(query));

    let matchFilter = true;
    if (modalFilterType === "all") {
      matchFilter = true;
    } else if (modalFilterType === "single" || modalFilterType === "main" || modalFilterType === "snack") {
      matchFilter = (m.type === modalFilterType);
    } else {
      matchFilter = m.methods.includes(modalFilterType);
    }

    return matchQuery && matchFilter;
  });

  if (!filtered.length) {
    container.innerHTML = '<div class="modal-empty">ไม่พบเมนูที่ตรงกับคำค้นหา</div>';
    return;
  }

  container.innerHTML = filtered.map(m => {
    const typeLabel = m.type === "single" ? "จานเดียว" : (m.type === "main" ? "กับข้าว" : (m.type === "snack" ? "ของว่าง" : "เครื่องเคียง"));
    const totalCal = m.type === "main" ? `${m.calories} (+ ข้าว 200)` : `${m.calories}`;

    return `
      <div class="modal-menu-item" onclick="selectMenu('${esc(m.name)}')">
        <div class="modal-menu-info">
          <h4>${esc(m.name)} <span class="nutrition-badge">🔥 ${totalCal} kcal · P ${m.protein}g</span></h4>
          <p class="modal-menu-need">ประเภท: ${typeLabel} · วัตถุดิบ: ${m.need.map(esc).join(", ")}</p>
        </div>
        <div>
          <span class="badge">${m.methods.join(" · ")}</span>
        </div>
      </div>
    `;
  }).join("");
}

// เรนเดอร์ UI ตารางอาหาร 7 วัน พร้อมแถบสารอาหารประจำวัน
function renderPlanner() {
  const container = document.querySelector("#plannerGrid");
  if (!container) return;

  const activeMeals = getActiveMeals();

  let totalPlanned = 0;
  DAYS.forEach(d => {
    activeMeals.forEach(m => {
      if (currentPlan[d.id]?.[m.id]) totalPlanned++;
    });
  });

  const totalSlots = DAYS.length * activeMeals.length;
  const summaryEl = document.querySelector("#plannerSummary");
  if (summaryEl) {
    summaryEl.textContent = `วางแผนแล้ว ${totalPlanned} / ${totalSlots} มื้อ (${activeMeals.length} มื้อ/วัน)`;
  }

  container.innerHTML = DAYS.map(day => {
    const dayPlan = currentPlan[day.id] || {};

    let dayCalories = 0;
    let dayProtein = 0;

    activeMeals.forEach(m => {
      const slot = dayPlan[m.id];
      if (slot) {
        const nut = getMealNutrition(slot);
        dayCalories += nut.calories;
        dayProtein += nut.protein;
      }
    });

    const calPercent = Math.min(100, Math.round((dayCalories / nutritionGoal.calories) * 100));

    let progressClass = "progress-fill-under";
    if (dayCalories >= nutritionGoal.calories * 0.85 && dayCalories <= nutritionGoal.calories * 1.15) {
      progressClass = "progress-fill-good";
    } else if (dayCalories > nutritionGoal.calories * 1.15) {
      progressClass = "progress-fill-over";
    }

    const mealsHtml = activeMeals.map(meal => {
      const item = dayPlan[meal.id];
      if (item) {
        const dish = menus.find(m => m.name === item.name);
        const nut = getMealNutrition(item);
        const isMainDish = (dish && dish.type === "main") || item.withRice;

        return `
          <div class="meal-slot slot-filled ${meal.isSnack ? "slot-snack" : ""}" onclick="openPicker('${day.id}', '${meal.id}')" title="คลิกเพื่อเปลี่ยนเมนู">
            <div class="meal-header">
              <span class="meal-tag">${meal.icon} ${meal.label}</span>
              <button class="slot-remove-btn" title="ลบมื้อนี้" onclick="removeMeal(event, '${day.id}', '${meal.id}')">✕</button>
            </div>

            <div class="meal-dish-name">
              ${esc(item.name)}
            </div>

            <div class="meal-combos">
              ${isMainDish ? `
                <button class="rice-toggle-btn ${item.withRice ? "active" : ""}" title="คลิกเพื่อเปิด/ปิดข้าวสวย" onclick="toggleRice(event, '${day.id}', '${meal.id}')">
                  🍚 ${item.withRice ? "มีข้าวสวย (+200)" : "ไม่เอาข้าว"}
                </button>
              ` : ""}
              ${item.sideDish ? `
                <span class="side-dish-tag">+ 🥚 ${esc(item.sideDish)}</span>
              ` : ""}
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
              <span class="nutrition-badge">🔥 ${nut.calories} kcal · P ${nut.protein}g</span>
              ${item.methods ? `<span class="badge">${item.methods.join(", ")}</span>` : ""}
            </div>
          </div>
        `;
      } else {
        return `
          <div class="meal-slot slot-empty ${meal.isSnack ? "slot-empty-snack" : ""}" onclick="openPicker('${day.id}', '${meal.id}')" title="คลิกเพื่อเลือกเมนู">
            <span class="meal-tag">${meal.icon} ${meal.label}</span>
            <div class="empty-prompt">${meal.isSnack ? "+ เลือกของว่าง" : "+ เพิ่มเมนู"}</div>
          </div>
        `;
      }
    }).join("");

    return `
      <div class="day-card" data-day="${day.id}">
        <div class="day-header">
          <h3>${day.label}</h3>
          <span class="day-short">${day.short}</span>
        </div>

        <!-- แถบแสดงสารอาหารประจำวัน -->
        <div class="day-nutrition">
          <div class="meter-info">
            <span>🔥 <strong>${dayCalories.toLocaleString()}</strong> / ${nutritionGoal.calories.toLocaleString()} kcal (${calPercent}%)</span>
            <span>🥩 โปรตีน <strong>${dayProtein}</strong> / ${nutritionGoal.protein}g</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill ${progressClass}" style="width: ${calPercent}%;"></div>
          </div>
        </div>

        <div class="meal-slots">
          ${mealsHtml}
        </div>
      </div>
    `;
  }).join("");
}

// ==========================================
// รายการของที่ต้องซื้อ (Smart Grocery List)
// ==========================================
function calculateGroceryList() {
  const savedIngredients = new Set(JSON.parse(localStorage.getItem("ingredients-v1") || "[]"));
  const ingredientCounts = {};
  const activeMeals = getActiveMeals();

  DAYS.forEach(d => {
    activeMeals.forEach(m => {
      const slot = currentPlan[d.id]?.[m.id];
      if (slot && slot.name) {
        const dishObj = menus.find(menu => menu.name === slot.name);
        if (dishObj && dishObj.need) {
          dishObj.need.forEach(item => {
            const cleanName = item.split("|")[0].trim();
            if (!basics.includes(cleanName)) {
              ingredientCounts[cleanName] = (ingredientCounts[cleanName] || 0) + 1;
            }
          });
        }

        if (slot.withRice) {
          ingredientCounts["ข้าวสวย"] = (ingredientCounts["ข้าวสวย"] || 0) + 1;
        }

        if (slot.sideDish) {
          const sideObj = menus.find(menu => menu.name === slot.sideDish);
          if (sideObj && sideObj.need) {
            sideObj.need.forEach(item => {
              const cleanName = item.split("|")[0].trim();
              if (!basics.includes(cleanName)) {
                ingredientCounts[cleanName] = (ingredientCounts[cleanName] || 0) + 1;
              }
            });
          }
        }
      }
    });
  });

  const allNeededNames = Object.keys(ingredientCounts);
  const toBuy = [];
  const inStock = [];

  allNeededNames.forEach(name => {
    const info = {
      name,
      count: ingredientCounts[name],
      inStock: savedIngredients.has(name)
    };
    if (info.inStock) {
      inStock.push(info);
    } else {
      toBuy.push(info);
    }
  });

  const categorized = {};
  Object.keys(groups).forEach(g => { categorized[g] = []; });
  categorized["อื่น ๆ"] = [];

  [...toBuy, ...inStock].forEach(item => {
    let placed = false;
    for (const [groupName, items] of Object.entries(groups)) {
      if (items.includes(item.name)) {
        categorized[groupName].push(item);
        placed = true;
        break;
      }
    }
    if (!placed) {
      categorized["อื่น ๆ"].push(item);
    }
  });

  return {
    toBuy,
    inStock,
    totalCount: allNeededNames.length,
    categorized
  };
}

function openGroceryModal() {
  const data = calculateGroceryList();
  const modal = document.querySelector("#groceryModal");

  if (data.totalCount === 0) {
    alert("ยังไม่มีเมนูในตารางอาหาร\nลองเลือกเมนูอาหารหรือกด '⚡ สุ่มจัดตารางตามเป้าหมายแคลอรี' ก่อนนะครับ");
    return;
  }

  const statsContainer = document.querySelector("#groceryStats");
  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="stat-box">
        <div class="num stat-orange">${data.toBuy.length}</div>
        <div class="label">ต้องซื้อเพิ่ม</div>
      </div>
      <div class="stat-box">
        <div class="num stat-green">${data.inStock.length}</div>
        <div class="label">มีในตู้เย็นแล้ว</div>
      </div>
      <div class="stat-box">
        <div class="num">${data.totalCount}</div>
        <div class="label">วัตถุดิบรวม</div>
      </div>
    `;
  }

  const contentContainer = document.querySelector("#groceryContent");
  if (contentContainer) {
    const groupsHtml = Object.entries(data.categorized)
      .filter(([_, items]) => items.length > 0)
      .map(([groupName, items]) => {
        items.sort((a, b) => (a.inStock === b.inStock ? 0 : a.inStock ? 1 : -1));

        return `
          <div class="grocery-group">
            <h4>📦 ${groupName} (${items.length})</h4>
            <div class="grocery-list">
              ${items.map(item => `
                <div class="grocery-item ${item.inStock ? "in-stock" : "to-buy"}">
                  <div class="grocery-item-left">
                    <input type="checkbox" class="grocery-checkbox" ${item.inStock ? "checked" : ""}>
                    <span class="grocery-name">${esc(item.name)}</span>
                    <span class="grocery-meals-count">(ใช้ ${item.count} มื้อ)</span>
                  </div>
                  <div>
                    <span class="grocery-status-badge ${item.inStock ? "badge-green" : "badge-orange"}">
                      ${item.inStock ? "✓ มีแล้ว" : "🛒 ต้องซื้อ"}
                    </span>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      }).join("");

    contentContainer.innerHTML = groupsHtml;
  }

  if (modal) {
    modal.style.display = "flex";
  }
}

function closeGroceryModal() {
  const modal = document.querySelector("#groceryModal");
  if (modal) {
    modal.style.display = "none";
  }
}

function copyGroceryListToClipboard() {
  const data = calculateGroceryList();
  if (!data.toBuy.length && !data.inStock.length) return;

  let text = "🛒 รายการของที่ต้องซื้อสำหรับตารางอาหารประจำสัปดาห์:\n\n";

  if (data.toBuy.length > 0) {
    text += "🔴 [ต้องซื้อเพิ่ม]:\n";
    data.toBuy.forEach(item => {
      text += ` • ${item.name} (ใช้ ${item.count} มื้อ)\n`;
    });
  } else {
    text += "🎉 วัตถุดิบครบแล้ว มีของในตู้เย็นพร้อมทุกเมนู!\n";
  }

  if (data.inStock.length > 0) {
    text += "\n🟢 [มีในตู้เย็นแล้ว]:\n";
    data.inStock.forEach(item => {
      text += ` • ${item.name} (ใช้ ${item.count} มื้อ)\n`;
    });
  }

  navigator.clipboard.writeText(text).then(() => {
    const copyBtn = document.querySelector("#copyGroceryBtn");
    if (copyBtn) {
      const origText = copyBtn.textContent;
      copyBtn.textContent = "✅ คัดลอกลง Clipboard เรียบร้อยแล้ว!";
      setTimeout(() => { copyBtn.textContent = origText; }, 2000);
    }
  }).catch(() => {
    alert("คัดลอกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
  });
}

// ==========================================
// ผูก Event การทำงานทั้งหมด
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  updateNutritionGoalUI();
  updateSnackBtnUI();

  // ปุ่มสลับโหมดมื้อว่าง
  const toggleSnackBtn = document.querySelector("#toggleSnackBtn");
  if (toggleSnackBtn) toggleSnackBtn.onclick = toggleSnackSetting;

  const openNutritionBtn = document.querySelector("#openNutritionModalBtn");
  if (openNutritionBtn) openNutritionBtn.onclick = openNutritionModal;

  const closeNutritionBtn = document.querySelector("#closeNutritionBtn");
  if (closeNutritionBtn) closeNutritionBtn.onclick = closeNutritionModal;

  const saveNutritionBtn = document.querySelector("#saveNutritionGoalBtn");
  if (saveNutritionBtn) saveNutritionBtn.onclick = saveNutritionGoal;

  const runCalcBtn = document.querySelector("#runCalcBtn");
  if (runCalcBtn) runCalcBtn.onclick = runBmrTdeeCalculation;

  // Preset buttons
  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.onclick = () => {
      const cal = btn.dataset.presetCal;
      const pro = btn.dataset.presetPro;
      const calInput = document.querySelector("#targetCaloriesInput");
      const proInput = document.querySelector("#targetProteinInput");
      if (calInput) calInput.value = cal;
      if (proInput) proInput.value = pro;
    };
  });

  // ปุ่มสุ่มจัดตารางอาหารอัจฉริยะ
  const autoPlanBtn = document.querySelector("#autoPlanBtn");
  if (autoPlanBtn) {
    autoPlanBtn.onclick = autoGeneratePlan;
  }

  // ปุ่มล้างตาราง
  const clearBtn = document.querySelector("#clearPlannerBtn");
  if (clearBtn) {
    clearBtn.onclick = clearAllPlan;
  }

  // ปุ่มเปิดรายการของที่ต้องซื้อ
  const groceryBtn = document.querySelector("#groceryListBtn");
  if (groceryBtn) {
    groceryBtn.onclick = openGroceryModal;
  }

  const closeGroceryBtn = document.querySelector("#closeGroceryBtn");
  if (closeGroceryBtn) {
    closeGroceryBtn.onclick = closeGroceryModal;
  }

  const copyGroceryBtn = document.querySelector("#copyGroceryBtn");
  if (copyGroceryBtn) {
    copyGroceryBtn.onclick = copyGroceryListToClipboard;
  }

  // Modal เมนู
  const closeBtn = document.querySelector("#closeModalBtn");
  if (closeBtn) closeBtn.onclick = closePicker;

  const modal = document.querySelector("#menuPickerModal");
  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) closePicker();
    };
  }

  const groceryModal = document.querySelector("#groceryModal");
  if (groceryModal) {
    groceryModal.onclick = (e) => {
      if (e.target === groceryModal) closeGroceryModal();
    };
  }

  const nutritionModal = document.querySelector("#nutritionModal");
  if (nutritionModal) {
    nutritionModal.onclick = (e) => {
      if (e.target === nutritionModal) closeNutritionModal();
    };
  }

  const modalSearch = document.querySelector("#modalSearch");
  if (modalSearch) {
    modalSearch.addEventListener("input", renderModalMenuList);
  }

  // กดปุ่ม Esc เพื่อปิด Modal ทั้งหมด
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closePicker();
      closeGroceryModal();
      closeNutritionModal();
    }
  });

  renderPlanner();
});
