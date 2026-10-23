// รายการเครื่องปรุง/วัตถุดิบพื้นฐาน: ไม่ต้องเลือกและไม่นำมาคิดเป็นวัตถุดิบที่ขาด
const basics = [
  "เกลือ",
  "น้ำตาล",
  "น้ำปลา",
  "น้ำมัน",
  "กระเทียม",
  "พริก"
];

// ข้อมูลโภชนาการของข้าวสวยมาตรฐาน (1 จาน = 2 ทัพพี)
const RICE_SERVING = {
  name: "ข้าวสวย",
  calories: 200,
  protein: 4,
  carbs: 44,
  fat: 1
};

// หมวดหมู่วัตถุดิบ
const groups = {
  "เนื้อสัตว์": ["หมู", "ไก่", "ปลา", "กุ้ง", "ปลาหมึก"],
  "ไข่และเต้าหู้": ["ไข่", "เต้าหู้"],
  "ผักและสมุนไพร": [
    "ผักกาดขาว", "ต้นหอม", "เห็ด", "ข่า", "ฟักทอง", "ข้าวโพด",
    "ใบแมงลัก", "ผักบุ้ง", "มะนาว", "มะขามเปียก", "ชะอม",
    "หัวไชเท้า", "ฟัก", "ใบกะเพรา", "คะน้า", "กะหล่ำปลี",
    "ถั่วงอก", "เห็ดออรินจิ", "มะเขือยาว", "ตะไคร้", "ใบมะกรูด", "ขมิ้น"
  ],
  "ของว่างและผลไม้": [
    "กล้วยหอม", "นมถั่วเหลือง", "นมจืด", "โยเกิร์ต", 
    "ถั่วอัลมอนด์", "ขนมปังโฮลวีต", "แอปเปิ้ล", "ฝรั่ง"
  ],
  "เส้นและอื่น ๆ": ["วุ้นเส้น", "กะทิ", "แป้งทอดกรอบ", "ข้าวสวย", "บะหมี่กึ่งสำเร็จรูป", "เส้นใหญ่"]
};

// ข้อมูลตัวเลือกเป้าหมายอาหาร (Goal Options)
const GOAL_OPTIONS = [
  { id: "clean", label: "🌿 กินคลีน / ไขมันต่ำ", desc: "เน้นอาหารต้ม ย่าง ผักเยอะ น้ำมันน้อย ดีต่อสุขภาพ" },
  { id: "high-protein", label: "💪 เพิ่มกล้าม / โปรตีนสูง", desc: "เน้นเนื้อสัตว์ ปลา ไข่ โปรตีนแน่น 24g+ ต่อมื้อ" },
  { id: "quick", label: "⚡ ทำง่าย / ประหยัดเวลา", desc: "วัตถุดิบน้อย ขั้นตอนไม่ยุ่งยาก ปรุงไวใน 15 นาที" },
  { id: "budget", label: "💰 ประหยัดงบ / สบายกระเป๋า", desc: "วัตถุดิบหาง่าย ราคาประหยัด เช่น ไข่ ไก่ เต้าหู้" },
  { id: "balanced", label: "⚖️ ทั่วไป / อร่อยสมดุล", desc: "รวมเมนูหลากหลาย รสชาติถูกปาก อิ่มสบายกำลังดี" }
];

// ข้อมูลตัวเลือกสิ่งที่ไม่ทาน (Exclusion Options)
const EXCLUSION_OPTIONS = [
  { id: "pork", label: "❌ ไม่กินหมู" },
  { id: "chicken", label: "❌ ไม่กินไก่" },
  { id: "seafood", label: "❌ แพ้อาหารทะเล (กุ้ง/หมึก)" },
  { id: "fish", label: "❌ ไม่กินปลา" },
  { id: "vegetarian", label: "🥗 มังสวิรัติ (ไข่/เต้าหู้/ผัก)" }
];

// ฐานข้อมูลเมนูอาหาร พร้อมข้อมูลจัดกลุ่มตามความต้องการ:
//  - meatTypes: ["pork", "chicken", "fish", "seafood", "egg", "tofu", "veg"]
//  - tags: ["clean", "high-protein", "quick", "budget", "comfort"]
const menus = [
  // --- อาหารจานเดียวและกับข้าวหลัก ---
  { name: "ต้มจืดเต้าหู้หมูสับ", type: "main", methods: ["ต้ม"], need: ["เต้าหู้", "ผักกาดขาว", "หมู"], calories: 220, protein: 18, carbs: 6, fat: 14, meatTypes: ["pork", "tofu"], tags: ["clean", "quick", "budget"] },
  { name: "ต้มจืดไข่น้ำ", type: "main", methods: ["ต้ม", "ทอด"], need: ["ไข่", "ต้นหอม"], calories: 200, protein: 14, carbs: 4, fat: 14, meatTypes: ["egg"], tags: ["clean", "quick", "budget"] },
  { name: "แกงจืดวุ้นเส้น", type: "single", methods: ["ต้ม"], need: ["วุ้นเส้น", "หมู", "ผักกาดขาว"], calories: 260, protein: 16, carbs: 32, fat: 8, meatTypes: ["pork"], tags: ["clean", "quick", "budget"] },
  { name: "ต้มยำไก่น้ำใส", type: "main", methods: ["ต้ม"], need: ["ไก่", "เห็ด", "มะนาว"], calories: 180, protein: 26, carbs: 8, fat: 4, meatTypes: ["chicken"], tags: ["clean", "high-protein", "quick", "budget"] },
  { name: "ต้มข่าไก่", type: "main", methods: ["ต้ม"], need: ["ไก่", "กะทิ", "เห็ด", "ข่า"], calories: 350, protein: 22, carbs: 10, fat: 25, meatTypes: ["chicken"], tags: ["high-protein", "comfort"] },
  { name: "แกงเลียงผักรวม", type: "main", methods: ["ต้ม"], need: ["ฟักทอง", "ข้าวโพด", "กุ้ง", "ใบแมงลัก"], calories: 160, protein: 14, carbs: 20, fat: 3, meatTypes: ["seafood"], tags: ["clean", "budget"] },
  { name: "แกงส้มผักรวม", type: "main", methods: ["ต้ม"], need: ["ผักบุ้ง", "กุ้ง", "มะขามเปียก"], calories: 150, protein: 16, carbs: 18, fat: 2, meatTypes: ["seafood"], tags: ["clean", "budget"] },
  { name: "ไข่พะโล้", type: "main", methods: ["ต้ม"], need: ["ไข่", "หมู", "เต้าหู้"], calories: 380, protein: 24, carbs: 18, fat: 24, meatTypes: ["pork", "egg", "tofu"], tags: ["high-protein", "comfort"] },
  { name: "ต้มจับฉ่าย", type: "main", methods: ["ต้ม"], need: ["ผักกาดขาว", "หัวไชเท้า", "หมู"], calories: 180, protein: 14, carbs: 12, fat: 8, meatTypes: ["pork"], tags: ["clean", "budget"] },
  { name: "แกงจืดฟักไก่", type: "main", methods: ["ต้ม"], need: ["ฟัก", "ไก่"], calories: 160, protein: 20, carbs: 10, fat: 4, meatTypes: ["chicken"], tags: ["clean", "quick", "budget"] },
  { name: "ต้มยำกุ้ง", type: "main", methods: ["ต้ม"], need: ["กุ้ง", "เห็ด", "มะนาว", "ข่า"], calories: 150, protein: 22, carbs: 8, fat: 3, meatTypes: ["seafood"], tags: ["clean", "quick"] },
  { name: "ไข่เจียวหมูสับ", type: "main", methods: ["ทอด"], need: ["ไข่", "หมู"], calories: 380, protein: 20, carbs: 4, fat: 32, meatTypes: ["pork", "egg"], tags: ["quick", "comfort", "budget"] },
  { name: "ไข่เจียวชะอม", type: "main", methods: ["ทอด"], need: ["ไข่", "ชะอม"], calories: 300, protein: 14, carbs: 5, fat: 26, meatTypes: ["egg"], tags: ["quick", "budget"] },
  { name: "หมูทอดกระเทียม", type: "main", methods: ["ทอด"], need: ["หมู"], calories: 420, protein: 26, carbs: 6, fat: 32, meatTypes: ["pork"], tags: ["high-protein", "quick", "comfort"] },
  { name: "ไก่ทอด", type: "main", methods: ["ทอด"], need: ["ไก่"], calories: 320, protein: 28, carbs: 8, fat: 20, meatTypes: ["chicken"], tags: ["high-protein", "quick", "budget"] },
  { name: "ปลาทอด", type: "main", methods: ["ทอด"], need: ["ปลา"], calories: 280, protein: 30, carbs: 6, fat: 15, meatTypes: ["fish"], tags: ["high-protein", "quick"] },
  { name: "กุ้งชุบแป้งทอด", type: "main", methods: ["ทอด"], need: ["กุ้ง", "แป้งทอดกรอบ"], calories: 340, protein: 20, carbs: 26, fat: 18, meatTypes: ["seafood"], tags: ["comfort"] },
  { name: "หมูทอดน้ำปลา", type: "main", methods: ["ทอด"], need: ["หมู"], calories: 390, protein: 24, carbs: 2, fat: 32, meatTypes: ["pork"], tags: ["high-protein", "quick", "comfort"] },
  { name: "ปลาหมึกทอดกระเทียม", type: "main", methods: ["ทอด"], need: ["ปลาหมึก"], calories: 290, protein: 26, carbs: 6, fat: 18, meatTypes: ["seafood"], tags: ["high-protein", "quick"] },
  { name: "ผัดผักบุ้งไฟแดง", type: "main", methods: ["ทอด"], need: ["ผักบุ้ง"], calories: 160, protein: 4, carbs: 10, fat: 12, meatTypes: ["veg"], tags: ["quick", "budget"] },
  { name: "ข้าวผัดไข่", type: "single", methods: ["ทอด"], need: ["ข้าวสวย", "ไข่", "ต้นหอม"], calories: 430, protein: 12, carbs: 60, fat: 16, meatTypes: ["egg"], tags: ["quick", "budget"] },
  { name: "ข้าวผัดหมู", type: "single", methods: ["ทอด"], need: ["ข้าวสวย", "หมู", "ไข่"], calories: 520, protein: 22, carbs: 62, fat: 20, meatTypes: ["pork", "egg"], tags: ["quick", "comfort"] },
  { name: "ข้าวผัดกุ้ง", type: "single", methods: ["ทอด"], need: ["ข้าวสวย", "กุ้ง", "ไข่"], calories: 480, protein: 24, carbs: 62, fat: 15, meatTypes: ["seafood", "egg"], tags: ["high-protein", "quick"] },
  { name: "ข้าวราดผัดกะเพราหมู", type: "single", methods: ["ทอด"], need: ["หมู", "ใบกะเพรา", "ข้าวสวย"], calories: 540, protein: 26, carbs: 54, fat: 24, meatTypes: ["pork"], tags: ["high-protein", "quick", "comfort"] },
  { name: "ข้าวราดผัดกะเพราไก่", type: "single", methods: ["ทอด"], need: ["ไก่", "ใบกะเพรา", "ข้าวสวย"], calories: 490, protein: 30, carbs: 54, fat: 17, meatTypes: ["chicken"], tags: ["clean", "high-protein", "quick", "budget"] },
  { name: "ข้าวราดผัดคะน้าหมู", type: "single", methods: ["ทอด"], need: ["คะน้า", "หมู", "ข้าวสวย"], calories: 520, protein: 24, carbs: 52, fat: 26, meatTypes: ["pork"], tags: ["high-protein", "quick", "comfort"] },
  { name: "ผัดกะหล่ำปลีไข่", type: "main", methods: ["ทอด"], need: ["กะหล่ำปลี", "ไข่"], calories: 220, protein: 10, carbs: 12, fat: 15, meatTypes: ["egg"], tags: ["quick", "budget"] },
  { name: "ผัดถั่วงอกเต้าหู้", type: "main", methods: ["ทอด"], need: ["ถั่วงอก", "เต้าหู้"], calories: 210, protein: 12, carbs: 10, fat: 14, meatTypes: ["tofu"], tags: ["clean", "quick", "budget"] },
  { name: "ผัดมาม่าไข่", type: "single", methods: ["ทอด"], need: ["บะหมี่กึ่งสำเร็จรูป", "ไข่", "กะหล่ำปลี"], calories: 460, protein: 12, carbs: 58, fat: 20, meatTypes: ["egg"], tags: ["quick", "budget", "comfort"] },
  { name: "ผัดซีอิ๊วหมู", type: "single", methods: ["ทอด"], need: ["เส้นใหญ่", "หมู", "คะน้า", "ไข่"], calories: 540, protein: 24, carbs: 60, fat: 22, meatTypes: ["pork", "egg"], tags: ["high-protein", "comfort"] },
  { name: "หมูย่าง", type: "main", methods: ["ย่าง"], need: ["หมู"], calories: 280, protein: 28, carbs: 2, fat: 18, meatTypes: ["pork"], tags: ["clean", "high-protein", "quick"] },
  { name: "ไก่ย่าง", type: "main", methods: ["ย่าง"], need: ["ไก่"], calories: 220, protein: 32, carbs: 1, fat: 10, meatTypes: ["chicken"], tags: ["clean", "high-protein", "quick", "budget"] },
  { name: "ปลาย่าง", type: "main", methods: ["ย่าง"], need: ["ปลา"], calories: 190, protein: 34, carbs: 0, fat: 6, meatTypes: ["fish"], tags: ["clean", "high-protein", "quick"] },
  { name: "กุ้งย่าง", type: "main", methods: ["ย่าง"], need: ["กุ้ง"], calories: 140, protein: 26, carbs: 1, fat: 3, meatTypes: ["seafood"], tags: ["clean", "high-protein", "quick"] },
  { name: "ปลาหมึกย่าง", type: "main", methods: ["ย่าง"], need: ["ปลาหมึก"], calories: 150, protein: 28, carbs: 2, fat: 3, meatTypes: ["seafood"], tags: ["clean", "high-protein", "quick"] },
  { name: "หมูย่างตะไคร้", type: "main", methods: ["ย่าง"], need: ["หมู", "ตะไคร้"], calories: 290, protein: 28, carbs: 4, fat: 18, meatTypes: ["pork"], tags: ["clean", "high-protein", "quick"] },
  { name: "ไก่ย่างขมิ้น", type: "main", methods: ["ย่าง"], need: ["ไก่", "ขมิ้น"], calories: 230, protein: 32, carbs: 3, fat: 10, meatTypes: ["chicken"], tags: ["clean", "high-protein", "quick", "budget"] },
  { name: "ปลาย่างสมุนไพร", type: "main", methods: ["ย่าง"], need: ["ปลา", "ตะไคร้", "ใบมะกรูด"], calories: 195, protein: 34, carbs: 2, fat: 6, meatTypes: ["fish"], tags: ["clean", "high-protein", "quick"] },

  // --- เครื่องเคียงเสริม (Side Dishes) ---
  { name: "ไข่ต้มยางมะตูม", type: "side", methods: ["ต้ม"], need: ["ไข่"], calories: 75, protein: 7, carbs: 1, fat: 5, meatTypes: ["egg"], tags: ["clean", "quick", "budget"] },
  { name: "ไข่ดาว", type: "side", methods: ["ทอด"], need: ["ไข่"], calories: 140, protein: 7, carbs: 1, fat: 12, meatTypes: ["egg"], tags: ["quick", "budget"] },
  { name: "เต้าหู้ทอด", type: "side", methods: ["ทอด"], need: ["เต้าหู้"], calories: 240, protein: 12, carbs: 8, fat: 18, meatTypes: ["tofu"], tags: ["budget"] },
  { name: "เห็ดออรินจิย่าง", type: "side", methods: ["ย่าง"], need: ["เห็ดออรินจิ"], calories: 80, protein: 4, carbs: 14, fat: 1, meatTypes: ["veg"], tags: ["clean", "quick", "budget"] },
  { name: "มะเขือยาวย่าง", type: "side", methods: ["ย่าง"], need: ["มะเขือยาว"], calories: 70, protein: 2, carbs: 14, fat: 1, meatTypes: ["veg"], tags: ["clean", "quick", "budget"] },
  { name: "ข้าวโพดย่าง", type: "side", methods: ["ย่าง"], need: ["ข้าวโพด"], calories: 130, protein: 4, carbs: 28, fat: 2, meatTypes: ["veg"], tags: ["clean", "quick", "budget"] },

  // --- มื้อว่างและผลไม้สุขภาพ (Healthy Snacks & Beverages) ---
  { name: "กล้วยหอม", type: "snack", methods: ["สด"], need: ["กล้วยหอม"], calories: 100, protein: 1, carbs: 27, fat: 0, meatTypes: ["veg"], tags: ["clean", "quick", "budget"] },
  { name: "นมถั่วเหลืองหวานน้อย", type: "snack", methods: ["ต้ม"], need: ["นมถั่วเหลือง"], calories: 120, protein: 8, carbs: 10, fat: 5, meatTypes: ["tofu"], tags: ["clean", "quick", "budget"] },
  { name: "นมจืดไขมันต่ำ", type: "snack", methods: ["ต้ม"], need: ["นมจืด"], calories: 120, protein: 8, carbs: 12, fat: 4, meatTypes: ["egg"], tags: ["clean", "quick", "budget"] },
  { name: "กรีกโยเกิร์ต", type: "snack", methods: ["สด"], need: ["โยเกิร์ต"], calories: 90, protein: 8, carbs: 10, fat: 2, meatTypes: ["veg"], tags: ["clean", "quick"] },
  { name: "ถั่วอัลมอนด์อบ", type: "snack", methods: ["ย่าง"], need: ["ถั่วอัลมอนด์"], calories: 160, protein: 6, carbs: 6, fat: 14, meatTypes: ["veg"], tags: ["clean", "quick"] },
  { name: "ขนมปังโฮลวีตปิ้ง", type: "snack", methods: ["ย่าง"], need: ["ขนมปังโฮลวีต"], calories: 140, protein: 6, carbs: 24, fat: 2, meatTypes: ["veg"], tags: ["clean", "quick", "budget"] },
  { name: "แอปเปิ้ลสด", type: "snack", methods: ["สด"], need: ["แอปเปิ้ล"], calories: 60, protein: 0, carbs: 15, fat: 0, meatTypes: ["veg"], tags: ["clean", "quick"] },
  { name: "ฝรั่งสด", type: "snack", methods: ["สด"], need: ["ฝรั่ง"], calories: 70, protein: 1, carbs: 16, fat: 0, meatTypes: ["veg"], tags: ["clean", "quick", "budget"] }
];
