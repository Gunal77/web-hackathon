import type {
  DepartmentCategory,
  Manu,
  RiskLevel,
  Sentiment
} from "@/lib/types/manu";
import { computePriorityScore } from "@/lib/utils/scoring";

// Taluk map for all 38 Tamil Nadu districts
export const districtTaluks: Record<string, string[]> = {
  Ariyalur: ["Ariyalur", "Sendurai", "Udayarpalayam"],
  Chengalpattu: ["Chengalpattu", "Tambaram", "Maduranthakam"],
  Chennai: ["Tondiarpet", "Egmore", "Mylapore", "Guindy", "Ambattur"],
  Coimbatore: ["Pollachi", "Mettupalayam", "Sulur", "Valparai"],
  Cuddalore: ["Cuddalore", "Chidambaram", "Kattumannarkoil"],
  Dharmapuri: ["Dharmapuri", "Harur", "Palacode"],
  Dindigul: ["Dindigul", "Palani", "Oddanchatram"],
  Erode: ["Erode", "Bhavani", "Gobichettipalayam"],
  Kallakurichi: ["Kallakurichi", "Ulundurpet", "Sankarapuram"],
  Kancheepuram: ["Kancheepuram", "Sriperumbudur", "Uthiramerur"],
  Karur: ["Karur", "Kulithalai", "Aravakurichi"],
  Krishnagiri: ["Krishnagiri", "Hosur", "Denkanikottai"],
  Madurai: ["Thiruparankundram", "Melur", "Usilampatti", "Peraiyur"],
  Mayiladuthurai: ["Mayiladuthurai", "Sirkazhi", "Thiruvidaimarudur"],
  Nagapattinam: ["Nagapattinam", "Kilvelur", "Thirukkuvalai"],
  Namakkal: ["Namakkal", "Rasipuram", "Tiruchengode"],
  Nilgiris: ["Ooty", "Coonoor", "Gudalur"],
  Perambalur: ["Perambalur", "Kunnam", "Veppanthattai"],
  Pudukkottai: ["Pudukkottai", "Aranthangi", "Iluppur"],
  Ramanathapuram: ["Ramanathapuram", "Rameswaram", "Paramakudi"],
  Ranipet: ["Ranipet", "Arcot", "Walajabad"],
  Salem: ["Attur", "Mettur", "Omalur", "Sangagiri"],
  Sivagangai: ["Sivagangai", "Karaikudi", "Devakottai"],
  Tenkasi: ["Tenkasi", "Sankarankovil", "Kadayanallur"],
  Thanjavur: ["Thanjavur", "Pattukkottai", "Kumbakonam"],
  Theni: ["Theni", "Periyakulam", "Bodinayakanur"],
  Thoothukudi: ["Thoothukudi", "Kovilpatti", "Tiruchendur"],
  Tiruchirappalli: ["Lalgudi", "Manapparai", "Thottiyam", "Srirangam"],
  Tirunelveli: ["Tirunelveli", "Palayamkottai", "Ambasamudram"],
  Tirupattur: ["Tirupattur", "Vaniyambadi", "Ambur"],
  Tiruppur: ["Tiruppur", "Avinashi", "Palladam"],
  Tiruvallur: ["Tiruvallur", "Poonamallee", "Gummidipoondi"],
  Tiruvannamalai: ["Tiruvannamalai", "Arni", "Polur"],
  Tiruvarur: ["Tiruvarur", "Mannargudi", "Thiruthuraipoondi"],
  Vellore: ["Vellore", "Gudiyatham", "Anaicut"],
  Villupuram: ["Villupuram", "Tindivanam", "Kallakurichi"],
  Virudhunagar: ["Virudhunagar", "Srivilliputhur", "Sivakasi"],
  Kanyakumari: ["Nagercoil", "Marthandam", "Kalkulam"]
};

// All 38 Tamil Nadu districts per spec (Kanyakumari last)
export const tamilNaduDistricts: string[] = [
  "Ariyalur",
  "Chengalpattu",
  "Chennai",
  "Coimbatore",
  "Cuddalore",
  "Dharmapuri",
  "Dindigul",
  "Erode",
  "Kallakurichi",
  "Kancheepuram",
  "Karur",
  "Krishnagiri",
  "Madurai",
  "Mayiladuthurai",
  "Nagapattinam",
  "Namakkal",
  "Nilgiris",
  "Perambalur",
  "Pudukkottai",
  "Ramanathapuram",
  "Ranipet",
  "Salem",
  "Sivagangai",
  "Tenkasi",
  "Thanjavur",
  "Theni",
  "Thoothukudi",
  "Tiruchirappalli",
  "Tirunelveli",
  "Tirupattur",
  "Tiruppur",
  "Tiruvallur",
  "Tiruvannamalai",
  "Tiruvarur",
  "Vellore",
  "Villupuram",
  "Virudhunagar",
  "Kanyakumari"
];

const categories: DepartmentCategory[] = [
  "Health",
  "Revenue",
  "Electricity",
  "Water Supply",
  "Roads",
  "Police",
  "Education"
];

const sentiments: Sentiment[] = [
  "Positive",
  "Neutral",
  "Negative",
  "Severe Distress"
];

const risks: RiskLevel[] = ["Low", "Moderate", "High", "Critical"];

function createManuSeed(
  id: number,
  district: string,
  taluk: string,
  overrides: Partial<Omit<Manu, "id" | "district" | "taluk" | "priorityScore">>
): Manu {
  const createdDate = overrides.createdDate ?? new Date().toISOString();
  const pendingDays = overrides.pendingDays ?? Math.floor(Math.random() * 20);
  const sentiment = overrides.sentiment ?? sentiments[id % sentiments.length];
  const riskLevel = overrides.riskLevel ?? risks[id % risks.length];
  const departmentCategory =
    overrides.departmentCategory ?? categories[id % categories.length];

  const base: Omit<Manu, "id" | "priorityScore"> = {
    citizenName: overrides.citizenName ?? `Citizen ${id}`,
    district,
    taluk,
    departmentCategory,
    title:
      overrides.title ??
      (overrides.descriptionText
        ? overrides.descriptionText.slice(0, 40)
        : "Grievance submitted via portal"),
    descriptionText:
      overrides.descriptionText ??
      "Issue reported via Mudhalvarin Mugavari portal.",
    sentiment,
    riskLevel,
    status: overrides.status ?? "Submitted",
    createdDate,
    pendingDays,
    lastUpdatedDate: overrides.lastUpdatedDate ?? createdDate
  };

  const priorityScore = computePriorityScore({
    sentiment: base.sentiment,
    riskLevel: base.riskLevel,
    pendingDays: base.pendingDays
  });

  return {
    id: id.toString(),
    ...base,
    priorityScore
  };
}

// Seeded manus to cover demo scenarios
const seededManus: Manu[] = [];

let counter = 1;

// Critical sentiment samples for AI-flagged demo
const criticalSamples: { desc: string; sent: Sentiment; risk: RiskLevel }[] = [
  {
    desc: "I have no hope left. Feeling suicidal due to unresolved land dispute. Need immediate help.",
    sent: "Severe Distress",
    risk: "Critical"
  },
  {
    desc: "Extremely frustrated with water supply. Nothing works, cannot take this anymore. Give up.",
    sent: "Severe Distress",
    risk: "Critical"
  },
  {
    desc: "Mental distress and anxiety from harassment by local officials. Need support urgently.",
    sent: "Severe Distress",
    risk: "High"
  },
  {
    desc: "Health emergency - father had stroke, need immediate ambulance and hospital access.",
    sent: "Severe Distress",
    risk: "Critical"
  }
];

// Chennai - high road complaints with severe distress & critical risk
districtTaluks["Chennai"].forEach((taluk, ti) => {
  for (let i = 0; i < 8; i++) {
    const isCritical = ti === 0 && i < 4;
    const sample = isCritical ? criticalSamples[i % criticalSamples.length] : null;
    seededManus.push(
      createManuSeed(counter++, "Chennai", taluk, {
        departmentCategory: i % 2 === 0 ? "Roads" : "Water Supply",
        sentiment: sample?.sent ?? (i % 3 === 0 ? "Severe Distress" : "Negative"),
        riskLevel: sample?.risk ?? (i % 2 === 0 ? "Critical" : "High"),
        pendingDays: 10 + i,
        status: i % 4 === 0 ? "In Progress" : "Submitted",
        descriptionText:
          sample?.desc ??
          (i % 2 === 0
            ? "Severe road damage causing accidents and school access issues."
            : "Long-standing water logging affecting daily life.")
      })
    );
  }
});

// Coimbatore - mix of positive and neutral with some negatives
districtTaluks["Coimbatore"].forEach((taluk) => {
  for (let i = 0; i < 6; i++) {
    seededManus.push(
      createManuSeed(counter++, "Coimbatore", taluk, {
        departmentCategory: categories[i % categories.length],
        sentiment: i % 4 === 0 ? "Positive" : "Neutral",
        riskLevel: i % 3 === 0 ? "Moderate" : "Low",
        pendingDays: i,
        status: i % 3 === 0 ? "Resolved" : "Submitted",
        descriptionText:
          i % 4 === 0
            ? "Appreciation for quick resolution of water supply issue."
            : "Request for improved public facilities."
      })
    );
  }
});

// Madurai - backlog with high pending days
districtTaluks["Madurai"].forEach((taluk) => {
  for (let i = 0; i < 7; i++) {
    seededManus.push(
      createManuSeed(counter++, "Madurai", taluk, {
        departmentCategory: i % 2 === 0 ? "Health" : "Education",
        sentiment: i % 3 === 0 ? "Negative" : "Neutral",
        riskLevel: i % 3 === 0 ? "High" : "Moderate",
        pendingDays: 15 + i,
        status: "In Progress",
        descriptionText:
          i % 2 === 0
            ? "Request for additional doctors in PHC; long waiting times."
            : "Pending infrastructure works in government school."
      })
    );
  }
});

// Tiruchirappalli & Salem - balanced mix
["Tiruchirappalli", "Salem", "Erode", "Thanjavur", "Dindigul", "Vellore", "Dharmapuri", "Cuddalore"].forEach((district) => {
  (districtTaluks[district] ?? ["Headquarters"]).forEach((taluk) => {
    for (let i = 0; i < 5; i++) {
      seededManus.push(
        createManuSeed(counter++, district, taluk, {
          departmentCategory: categories[(counter + i) % categories.length],
          sentiment: sentiments[(counter + i) % sentiments.length],
          riskLevel: risks[(counter + i) % risks.length],
          pendingDays: (counter + i) % 18,
          status:
            (counter + i) % 3 === 0 ? "Resolved" : (counter + i) % 2 === 0
              ? "In Progress"
              : "Submitted"
        })
      );
    }
  });
});

export const manus: Manu[] = seededManus;

export function getDistricts(): string[] {
  return Object.keys(districtTaluks);
}

export function getTaluksForDistrict(district: string): string[] {
  return districtTaluks[district] ?? [];
}

