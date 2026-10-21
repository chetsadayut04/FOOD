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
  "เส้นและอื่น ๆ": ["วุ้นเส้น", "กะทิ", "แป้งทอดกรอบ", "ข้าวสวย", "บะหมี่กึ่งสำเร็จรูป", "เส้นใหญ่"]
};

// ฐานข้อมูลเมนูอาหาร
// type:
//  - "single": อาหารจานเดียว (มีข้าว/เส้นในตัว พลังงานครบในจาน)
//  - "main": กับข้าวหลัก (ปกติคนไทยทานคู่กับข้าวสวย +200 kcal)
//  - "side": เมนูเสริม/เครื่องเคียง (ไข่ต้ม, ไข่ดาว, ของทานเล่น)
const menus = [
  { name: "ต้มจืดเต้าหู้หมูสับ", type: "main", methods: ["ต้ม"], need: ["เต้าหู้", "ผักกาดขาว", "หมู"], calories: 220, protein: 18, carbs: 6, fat: 14 },
  { name: "ต้มจืดไข่น้ำ", type: "main", methods: ["ต้ม", "ทอด"], need: ["ไข่", "ต้นหอม"], calories: 200, protein: 14, carbs: 4, fat: 14 },
  { name: "แกงจืดวุ้นเส้น", type: "single", methods: ["ต้ม"], need: ["วุ้นเส้น", "หมู", "ผักกาดขาว"], calories: 260, protein: 16, carbs: 32, fat: 8 },
  { name: "ต้มยำไก่น้ำใส", type: "main", methods: ["ต้ม"], need: ["ไก่", "เห็ด", "มะนาว"], calories: 180, protein: 26, carbs: 8, fat: 4 },
  { name: "ต้มข่าไก่", type: "main", methods: ["ต้ม"], need: ["ไก่", "กะทิ", "เห็ด", "ข่า"], calories: 350, protein: 22, carbs: 10, fat: 25 },
  { name: "แกงเลียงผักรวม", type: "main", methods: ["ต้ม"], need: ["ฟักทอง", "ข้าวโพด", "กุ้ง", "ใบแมงลัก"], calories: 160, protein: 14, carbs: 20, fat: 3 },
  { name: "แกงส้มผักรวม", type: "main", methods: ["ต้ม"], need: ["ผักบุ้ง", "กุ้ง", "มะขามเปียก"], calories: 150, protein: 16, carbs: 18, fat: 2 },
  { name: "ไข่พะโล้", type: "main", methods: ["ต้ม"], need: ["ไข่", "หมู", "เต้าหู้"], calories: 380, protein: 24, carbs: 18, fat: 24 },
  { name: "ต้มจับฉ่าย", type: "main", methods: ["ต้ม"], need: ["ผักกาดขาว", "หัวไชเท้า", "หมู"], calories: 180, protein: 14, carbs: 12, fat: 8 },
  { name: "แกงจืดฟักไก่", type: "main", methods: ["ต้ม"], need: ["ฟัก", "ไก่"], calories: 160, protein: 20, carbs: 10, fat: 4 },
  { name: "ไข่ต้มยางมะตูม", type: "side", methods: ["ต้ม"], need: ["ไข่"], calories: 75, protein: 7, carbs: 1, fat: 5 },
  { name: "ต้มยำกุ้ง", type: "main", methods: ["ต้ม"], need: ["กุ้ง", "เห็ด", "มะนาว", "ข่า"], calories: 150, protein: 22, carbs: 8, fat: 3 },
  { name: "ไข่เจียวหมูสับ", type: "main", methods: ["ทอด"], need: ["ไข่", "หมู"], calories: 380, protein: 20, carbs: 4, fat: 32 },
  { name: "ไข่เจียวชะอม", type: "main", methods: ["ทอด"], need: ["ไข่", "ชะอม"], calories: 300, protein: 14, carbs: 5, fat: 26 },
  { name: "ไข่ดาว", type: "side", methods: ["ทอด"], need: ["ไข่"], calories: 140, protein: 7, carbs: 1, fat: 12 },
  { name: "หมูทอดกระเทียม", type: "main", methods: ["ทอด"], need: ["หมู"], calories: 420, protein: 26, carbs: 6, fat: 32 },
  { name: "ไก่ทอด", type: "main", methods: ["ทอด"], need: ["ไก่"], calories: 320, protein: 28, carbs: 8, fat: 20 },
  { name: "ปลาทอด", type: "main", methods: ["ทอด"], need: ["ปลา"], calories: 280, protein: 30, carbs: 6, fat: 15 },
  { name: "กุ้งชุบแป้งทอด", type: "main", methods: ["ทอด"], need: ["กุ้ง", "แป้งทอดกรอบ"], calories: 340, protein: 20, carbs: 26, fat: 18 },
  { name: "เต้าหู้ทอด", type: "side", methods: ["ทอด"], need: ["เต้าหู้"], calories: 240, protein: 12, carbs: 8, fat: 18 },
  { name: "หมูทอดน้ำปลา", type: "main", methods: ["ทอด"], need: ["หมู"], calories: 390, protein: 24, carbs: 2, fat: 32 },
  { name: "ปลาหมึกทอดกระเทียม", type: "main", methods: ["ทอด"], need: ["ปลาหมึก"], calories: 290, protein: 26, carbs: 6, fat: 18 },
  { name: "ผัดผักบุ้งไฟแดง", type: "main", methods: ["ทอด"], need: ["ผักบุ้ง"], calories: 160, protein: 4, carbs: 10, fat: 12 },
  { name: "ข้าวผัดไข่", type: "single", methods: ["ทอด"], need: ["ข้าวสวย", "ไข่", "ต้นหอม"], calories: 430, protein: 12, carbs: 60, fat: 16 },
  { name: "ข้าวผัดหมู", type: "single", methods: ["ทอด"], need: ["ข้าวสวย", "หมู", "ไข่"], calories: 520, protein: 22, carbs: 62, fat: 20 },
  { name: "ข้าวผัดกุ้ง", type: "single", methods: ["ทอด"], need: ["ข้าวสวย", "กุ้ง", "ไข่"], calories: 480, protein: 24, carbs: 62, fat: 15 },
  { name: "ข้าวราดผัดกะเพราหมู", type: "single", methods: ["ทอด"], need: ["หมู", "ใบกะเพรา", "ข้าวสวย"], calories: 540, protein: 26, carbs: 54, fat: 24 },
  { name: "ข้าวราดผัดกะเพราไก่", type: "single", methods: ["ทอด"], need: ["ไก่", "ใบกะเพรา", "ข้าวสวย"], calories: 490, protein: 30, carbs: 54, fat: 17 },
  { name: "ข้าวราดผัดคะน้าหมู", type: "single", methods: ["ทอด"], need: ["คะน้า", "หมู", "ข้าวสวย"], calories: 520, protein: 24, carbs: 52, fat: 26 },
  { name: "ผัดกะหล่ำปลีไข่", type: "main", methods: ["ทอด"], need: ["กะหล่ำปลี", "ไข่"], calories: 220, protein: 10, carbs: 12, fat: 15 },
  { name: "ผัดถั่วงอกเต้าหู้", type: "main", methods: ["ทอด"], need: ["ถั่วงอก", "เต้าหู้"], calories: 210, protein: 12, carbs: 10, fat: 14 },
  { name: "ผัดมาม่าไข่", type: "single", methods: ["ทอด"], need: ["บะหมี่กึ่งสำเร็จรูป", "ไข่", "กะหล่ำปลี"], calories: 460, protein: 12, carbs: 58, fat: 20 },
  { name: "ผัดซีอิ๊วหมู", type: "single", methods: ["ทอด"], need: ["เส้นใหญ่", "หมู", "คะน้า", "ไข่"], calories: 540, protein: 24, carbs: 60, fat: 22 },
  { name: "หมูย่าง", type: "main", methods: ["ย่าง"], need: ["หมู"], calories: 280, protein: 28, carbs: 2, fat: 18 },
  { name: "ไก่ย่าง", type: "main", methods: ["ย่าง"], need: ["ไก่"], calories: 220, protein: 32, carbs: 1, fat: 10 },
  { name: "ปลาย่าง", type: "main", methods: ["ย่าง"], need: ["ปลา"], calories: 190, protein: 34, carbs: 0, fat: 6 },
  { name: "กุ้งย่าง", type: "main", methods: ["ย่าง"], need: ["กุ้ง"], calories: 140, protein: 26, carbs: 1, fat: 3 },
  { name: "ปลาหมึกย่าง", type: "main", methods: ["ย่าง"], need: ["ปลาหมึก"], calories: 150, protein: 28, carbs: 2, fat: 3 },
  { name: "เห็ดออรินจิย่าง", type: "side", methods: ["ย่าง"], need: ["เห็ดออรินจิ"], calories: 80, protein: 4, carbs: 14, fat: 1 },
  { name: "มะเขือยาวย่าง", type: "side", methods: ["ย่าง"], need: ["มะเขือยาว"], calories: 70, protein: 2, carbs: 14, fat: 1 },
  { name: "ข้าวโพดย่าง", type: "side", methods: ["ย่าง"], need: ["ข้าวโพด"], calories: 130, protein: 4, carbs: 28, fat: 2 },
  { name: "หมูย่างตะไคร้", type: "main", methods: ["ย่าง"], need: ["หมู", "ตะไคร้"], calories: 290, protein: 28, carbs: 4, fat: 18 },
  { name: "ไก่ย่างขมิ้น", type: "main", methods: ["ย่าง"], need: ["ไก่", "ขมิ้น"], calories: 230, protein: 32, carbs: 3, fat: 10 },
  { name: "ปลาย่างสมุนไพร", type: "main", methods: ["ย่าง"], need: ["ปลา", "ตะไคร้", "ใบมะกรูด"], calories: 195, protein: 34, carbs: 2, fat: 6 }
];
