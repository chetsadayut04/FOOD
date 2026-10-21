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

const MEALS = [
  { id: "breakfast", label: "มื้อเช้า", icon: "🌅" },
  { id: "lunch", label: "มื้อกลางวัน", icon: "☀️" },
  { id: "dinner", label: "มื้อเย็น", icon: "🌙" }
];

// โครงสร้างเริ่มต้นของตารางอาหาร 7 วัน
function createDefaultPlan() {
  const plan = {};
  DAYS.forEach(day => {
    plan[day.id] = {
      breakfast: null,
      lunch: null,
      dinner: null
    };
  });
  return plan;
}

// โหลดข้อมูลตารางจาก LocalStorage
let currentPlan = JSON.parse(localStorage.getItem("mealplan-v1") || "null");
if (!currentPlan) {
  currentPlan = createDefaultPlan();
  // ข้อมูลตัวอย่างเริ่มต้นที่พลังงานเต็มอิ่มตามเป้าหมาย
  currentPlan.mon.breakfast = { name: "ต้มจืดไข่น้ำ", methods: ["ต้ม", "ทอด"], withRice: true, sideDish: null };
  currentPlan.mon.lunch = { name: "ข้าวราดผัดกะเพราหมู", methods: ["ทอด"], withRice: false, sideDish: "ไข่ดาว" };
  currentPlan.mon.dinner = { name: "หมูทอดกระเทียม", methods: ["ทอด"], withRice: true, sideDish: null };

  currentPlan.tue.breakfast = { name: "ข้าวผัดไข่", methods: ["ทอด"], withRice: false, sideDish: null };
  currentPlan.tue.lunch = { name: "ผัดซีอิ๊วหมู", methods: ["ทอด"], withRice: false, sideDish: null };
  currentPlan.tue.dinner = { name: "ไก่ย่าง", methods: ["ย่าง"], withRice: true, sideDish: null };
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
// สุ่มจัดตารางอาหารอัจฉริยะตามเป้าหมายแคลอรีจริง (Smart Nutrition Auto-Plan)
// ==========================================
function autoGeneratePlan() {
  let hasExisting = false;
  DAYS.forEach(d => {
    MEALS.forEach(m => {
      if (currentPlan[d.id]?.[m.id]) hasExisting = true;
    });
  });

  let onlyEmpty = false;
  if (hasExisting) {
    const overwriteAll = confirm(`ต้องการจัดตารางอาหารตามเป้าหมาย (${nutritionGoal.calories.toLocaleString()} Kcal/วัน):\n• กด [ตกลง / OK] เพื่อสุ่มใหม่ทั้งหมด 21 มื้อ\n• กด [ยกเลิก / Cancel] เพื่อสุ่มเฉพาะช่องที่ยังว่างอยู่`);
    if (!overwriteAll) {
      onlyEmpty = true;
    }
  }

  const savedIngredients = new Set(JSON.parse(localStorage.getItem("ingredients-v1") || "[]"));
  const usedMenuNames = new Set();

  if (onlyEmpty) {
    DAYS.forEach(d => {
      MEALS.forEach(m => {
        if (currentPlan[d.id]?.[m.id]) {
          usedMenuNames.add(currentPlan[d.id][m.id].name);
        }
      });
    });
  }

  // แยกเมนูหลัก (มื้ออาหารจริง) และเมนูเคียง/ของว่าง
  const mainAndSinglePool = menus.filter(m => m.type !== "side");
  const sidePool = menus.filter(m => m.type === "side");

  DAYS.forEach(day => {
    if (!currentPlan[day.id]) currentPlan[day.id] = {};

    const slots = ["breakfast", "lunch", "dinner"];
    const neededSlots = slots.filter(s => !onlyEmpty || !currentPlan[day.id][s]);

    if (!neededSlots.length) return;

    // คำนวณแคลอรีที่มีอยู่แล้วในวันนั้น
    let existingCalories = 0;
    slots.forEach(s => {
      if (currentPlan[day.id][s]) {
        existingCalories += getMealNutrition(currentPlan[day.id][s]).calories;
      }
    });

    // กำหนดสัดส่วนพลังงานของแต่ละมื้อ
    // เช้า: ~28%, กลางวัน: ~38%, เย็น: ~34%
    const slotTargets = {
      breakfast: nutritionGoal.calories * 0.28,
      lunch: nutritionGoal.calories * 0.38,
      dinner: nutritionGoal.calories * 0.34
    };

    neededSlots.forEach(slot => {
      const targetCalForSlot = slotTargets[slot] || (nutritionGoal.calories / 3);

      // กรองเมนูที่ยังไม่ซ้ำในสัปดาห์นี้
      const available = mainAndSinglePool.filter(m => !usedMenuNames.has(m.name));
      const poolToUse = available.length ? available : mainAndSinglePool;

      // คัดเลือกเมนูที่เมื่อรวมข้าวแล้วใกล้เคียงเป้าหมายของมื้อนั้นมากที่สุด
      const scored = poolToUse.map(dish => {
        const withRice = (dish.type === "main");
        const mealCal = dish.calories + (withRice ? RICE_SERVING.calories : 0);
        const calDiff = Math.abs(mealCal - targetCalForSlot);
        const pantryBonus = dish.need.some(n => savedIngredients.has(n)) ? -70 : 0;
        const randomFactor = (Math.random() - 0.5) * 50;

        return {
          dish,
          withRice,
          mealCal,
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
    });

    // ปรับความสมดุลทั้งวัน (Daily Calorie Balancing)
    // ถ้ายอดรวมทั้งวันยังไม่ถึงเป้าหมาย ให้เติมเมนูเคียง (ไข่ต้ม/ไข่ดาว) ลงในมื้อกลางวันหรือมื้อเช้า
    let currentDayCal = 0;
    slots.forEach(s => {
      currentDayCal += getMealNutrition(currentPlan[day.id][s]).calories;
    });

    const deficit = nutritionGoal.calories - currentDayCal;

    // ถ้าขาดมากกว่า 90 kcal ให้เพิ่มเมนูเสริมเข้าไปในมื้อกลางวัน
    if (deficit >= 90) {
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
let modalMethodFilter = new Set();

function openPicker(dayId, mealId) {
  activePickerSlot = { dayId, mealId };

  const dayObj = DAYS.find(d => d.id === dayId);
  const mealObj = MEALS.find(m => m.id === mealId);

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
      : "เลือกเมนูที่ต้องการเพื่อใส่ลงในมื้อนี้";
  }

  if (searchInput) searchInput.value = "";
  modalMethodFilter.clear();

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
    // กับข้าว (main) จะเสิร์ฟพร้อมข้าวสวยเป็นค่าเริ่มต้น
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

  container.innerHTML = ["ต้ม", "ทอด", "ย่าง"].map(method => `
    <button class="filter" aria-pressed="${modalMethodFilter.has(method)}" data-modal-method="${method}">
      ${method}
    </button>
  `).join("");

  container.querySelectorAll("[data-modal-method]").forEach(btn => {
    btn.onclick = () => {
      const method = btn.dataset.modalMethod;
      if (modalMethodFilter.has(method)) {
        modalMethodFilter.delete(method);
      } else {
        modalMethodFilter.add(method);
      }
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

    const matchMethod = !modalMethodFilter.size || 
      m.methods.some(method => modalMethodFilter.has(method));

    return matchQuery && matchMethod;
  });

  if (!filtered.length) {
    container.innerHTML = '<div class="modal-empty">ไม่พบเมนูที่ตรงกับคำค้นหา</div>';
    return;
  }

  container.innerHTML = filtered.map(m => {
    const typeLabel = m.type === "single" ? "จานเดียว" : (m.type === "main" ? "กับข้าว" : "เครื่องเคียง");
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

  let totalPlanned = 0;
  DAYS.forEach(d => {
    MEALS.forEach(m => {
      if (currentPlan[d.id]?.[m.id]) totalPlanned++;
    });
  });

  const summaryEl = document.querySelector("#plannerSummary");
  if (summaryEl) {
    summaryEl.textContent = `วางแผนแล้ว ${totalPlanned} / 21 มื้อ`;
  }

  container.innerHTML = DAYS.map(day => {
    const dayPlan = currentPlan[day.id] || {};

    let dayCalories = 0;
    let dayProtein = 0;

    MEALS.forEach(m => {
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

    const mealsHtml = MEALS.map(meal => {
      const item = dayPlan[meal.id];
      if (item) {
        const dish = menus.find(m => m.name === item.name);
        const nut = getMealNutrition(item);
        const isMainDish = (dish && dish.type === "main") || item.withRice;

        return `
          <div class="meal-slot slot-filled" onclick="openPicker('${day.id}', '${meal.id}')" title="คลิกเพื่อเปลี่ยนเมนู">
            <div class="meal-header">
              <span class="meal-tag">${meal.icon} ${meal.label}</span>
              <button class="slot-remove-btn" title="ลบมื้อนี้" onclick="removeMeal(event, '${day.id}', '${meal.id}')">✕</button>
            </div>

            <div class="meal-dish-name">
              ${esc(item.name)}
            </div>

            <!-- แถบแสดงส่วนประกอบเพิ่มเติม เช่น ข้าวสวย / เครื่องเคียง -->
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
          <div class="meal-slot slot-empty" onclick="openPicker('${day.id}', '${meal.id}')" title="คลิกเพื่อเลือกเมนู">
            <span class="meal-tag">${meal.icon} ${meal.label}</span>
            <div class="empty-prompt">+ เพิ่มเมนู</div>
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
// รายการของที่ต้องซื้อ (Step 4: Smart Grocery List)
// ==========================================
function calculateGroceryList() {
  const savedIngredients = new Set(JSON.parse(localStorage.getItem("ingredients-v1") || "[]"));
  const ingredientCounts = {};

  DAYS.forEach(d => {
    MEALS.forEach(m => {
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

        // นับข้าวสวยถ้าเลือกรับข้าว
        if (slot.withRice) {
          ingredientCounts["ข้าวสวย"] = (ingredientCounts["ข้าวสวย"] || 0) + 1;
        }

        // นับเมนูเสริม เช่น ไข่ต้ม, ไข่ดาว
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

  // ปุ่มสุ่มจัดตารางอาหารอัจฉริยะตามแคลอรี
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
