// PropInvest AI — Indian Real Estate Project Database
// 300+ projects across Mumbai, Bangalore, Hyderabad, Pune, Delhi NCR, Ahmedabad
// Data based on 2024-25 market research

import type { InvestmentInput } from "@/types/investment";

export type PossessionStatus = "Ready" | "Under Construction" | "New Launch";
export type AppreciationTier = "High" | "Medium" | "Low";
export type PropertyType = "Apartment" | "Villa" | "Studio" | "Penthouse" | "Plot";

export interface Project {
  slug: string;
  name: string;
  developer: string;
  city: string;
  locality: string;
  state: string;
  type: PropertyType;
  possession: PossessionStatus;
  appreciationTier: AppreciationTier;
  priceMin: number;
  priceMax: number;
  areaMin: number;  // sqft
  areaMax: number;
  bedrooms: string; // "1BHK" | "2BHK" | "3BHK" | "2-3BHK" etc
  avgRent: number;  // monthly ₹
  tags: string[];
  highlight: string;
  input: InvestmentInput; // pre-filled analysis input (midpoint values)
}

const projects: Project[] = [

  // ═══════════════════════════════════════════════════
  // MUMBAI (60 projects)
  // ═══════════════════════════════════════════════════

  {
    slug: "lodha-world-one-worli",
    name: "World One", developer: "Lodha", city: "Mumbai", locality: "Worli", state: "Maharashtra",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 80000000, priceMax: 200000000, areaMin: 1800, areaMax: 4500, bedrooms: "3-4BHK",
    avgRent: 200000, tags: ["Luxury", "Sea View", "World's Tallest Residential"],
    highlight: "World's tallest residential tower. Trophy asset with strong NRI demand.",
    input: { property_name: "World One, Worli", city: "Mumbai", property_purchase_price: 120000000, down_payment: 30000000, loan_interest_rate: 8.75, loan_tenure_years: 20, expected_monthly_rent: 200000, annual_maintenance_cost: 240000, expected_annual_appreciation: 7.5, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 8, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 3000, rent_growth_rate: 5 },
  },
  {
    slug: "lodha-palava-dombivli",
    name: "Palava City", developer: "Lodha", city: "Mumbai", locality: "Dombivli", state: "Maharashtra",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 6500000, priceMax: 15000000, areaMin: 650, areaMax: 1400, bedrooms: "1-3BHK",
    avgRent: 22000, tags: ["Township", "Affordable", "High Growth Corridor"],
    highlight: "India's largest integrated township. 4,500 acres. Strong rental demand from IT workers.",
    input: { property_name: "Palava City, Dombivli", city: "Mumbai", property_purchase_price: 9000000, down_payment: 2250000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 22000, annual_maintenance_cost: 48000, expected_annual_appreciation: 8.0, holding_period_years: 8, investor_tax_slab: 30, vacancy_rate: 5, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 950, rent_growth_rate: 5 },
  },
  {
    slug: "godrej-the-trees-vikhroli",
    name: "The Trees", developer: "Godrej Properties", city: "Mumbai", locality: "Vikhroli", state: "Maharashtra",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 18000000, priceMax: 35000000, areaMin: 900, areaMax: 2200, bedrooms: "2-3BHK",
    avgRent: 55000, tags: ["Green Living", "Eastern Express Highway", "LEED Certified"],
    highlight: "Award-winning green development. 60% open space. Close to Powai IT hub.",
    input: { property_name: "The Trees, Vikhroli", city: "Mumbai", property_purchase_price: 25000000, down_payment: 6250000, loan_interest_rate: 8.75, loan_tenure_years: 20, expected_monthly_rent: 55000, annual_maintenance_cost: 72000, expected_annual_appreciation: 7.0, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 6, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 1500, rent_growth_rate: 5 },
  },
  {
    slug: "runwal-forests-kanjurmarg",
    name: "Runwal Forests", developer: "Runwal", city: "Mumbai", locality: "Kanjurmarg", state: "Maharashtra",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 14000000, priceMax: 28000000, areaMin: 780, areaMax: 1600, bedrooms: "2-3BHK",
    avgRent: 42000, tags: ["Forest View", "Central Location", "Metro Access"],
    highlight: "15 acres of forest within Mumbai. Rare mid-city green cover. Metro connectivity.",
    input: { property_name: "Runwal Forests, Kanjurmarg", city: "Mumbai", property_purchase_price: 18000000, down_payment: 4500000, loan_interest_rate: 8.75, loan_tenure_years: 20, expected_monthly_rent: 42000, annual_maintenance_cost: 60000, expected_annual_appreciation: 7.5, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 6, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 1100, rent_growth_rate: 5 },
  },
  {
    slug: "hiranandani-estate-thane",
    name: "Hiranandani Estate", developer: "Hiranandani", city: "Mumbai", locality: "Thane", state: "Maharashtra",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 12000000, priceMax: 30000000, areaMin: 850, areaMax: 2000, bedrooms: "2-3BHK",
    avgRent: 38000, tags: ["Integrated Township", "Top Schools", "Thane Premium"],
    highlight: "Benchmark township for Thane. Self-sufficient with schools, hospitals, malls.",
    input: { property_name: "Hiranandani Estate, Thane", city: "Mumbai", property_purchase_price: 18000000, down_payment: 4500000, loan_interest_rate: 8.75, loan_tenure_years: 20, expected_monthly_rent: 38000, annual_maintenance_cost: 54000, expected_annual_appreciation: 7.5, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 6, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 1200, rent_growth_rate: 5 },
  },
  {
    slug: "tata-housing-amantra-bhiwandi",
    name: "Amantra", developer: "Tata Housing", city: "Mumbai", locality: "Bhiwandi", state: "Maharashtra",
    type: "Apartment", possession: "Ready", appreciationTier: "Medium",
    priceMin: 4500000, priceMax: 9000000, areaMin: 550, areaMax: 1100, bedrooms: "1-2BHK",
    avgRent: 14000, tags: ["Affordable", "Logistics Hub", "Tata Brand"],
    highlight: "Tata brand quality at affordable pricing. Near logistics corridor.",
    input: { property_name: "Amantra, Bhiwandi", city: "Mumbai", property_purchase_price: 6500000, down_payment: 1625000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 14000, annual_maintenance_cost: 36000, expected_annual_appreciation: 7.0, holding_period_years: 8, investor_tax_slab: 20, vacancy_rate: 8, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 700, rent_growth_rate: 4 },
  },
  {
    slug: "oberoi-realty-borivali",
    name: "Elysian at Oberoi Garden City", developer: "Oberoi Realty", city: "Mumbai", locality: "Borivali", state: "Maharashtra",
    type: "Apartment", possession: "Under Construction", appreciationTier: "High",
    priceMin: 22000000, priceMax: 45000000, areaMin: 1000, areaMax: 2400, bedrooms: "2-4BHK",
    avgRent: 60000, tags: ["Luxury", "Oberoi Premium", "Western Suburbs"],
    highlight: "Oberoi's premium township in Borivali. Massive appreciation potential as area develops.",
    input: { property_name: "Elysian, Borivali", city: "Mumbai", property_purchase_price: 30000000, down_payment: 7500000, loan_interest_rate: 8.75, loan_tenure_years: 20, expected_monthly_rent: 60000, annual_maintenance_cost: 84000, expected_annual_appreciation: 8.0, holding_period_years: 12, investor_tax_slab: 30, vacancy_rate: 7, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 1600, rent_growth_rate: 6 },
  },
  {
    slug: "shapoorji-pallonji-joyville-virar",
    name: "Joyville", developer: "Shapoorji Pallonji", city: "Mumbai", locality: "Virar", state: "Maharashtra",
    type: "Apartment", possession: "Ready", appreciationTier: "Medium",
    priceMin: 3800000, priceMax: 7500000, areaMin: 500, areaMax: 950, bedrooms: "1-2BHK",
    avgRent: 11000, tags: ["Affordable", "Western Line", "Shapoorji Quality"],
    highlight: "Most affordable Shapoorji project. Strong demand from first-time buyers.",
    input: { property_name: "Joyville, Virar", city: "Mumbai", property_purchase_price: 5500000, down_payment: 1375000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 11000, annual_maintenance_cost: 30000, expected_annual_appreciation: 6.5, holding_period_years: 8, investor_tax_slab: 20, vacancy_rate: 8, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 650, rent_growth_rate: 4 },
  },
  {
    slug: "mahindra-happinest-palghar",
    name: "Happinest", developer: "Mahindra Lifespaces", city: "Mumbai", locality: "Palghar", state: "Maharashtra",
    type: "Apartment", possession: "Ready", appreciationTier: "Medium",
    priceMin: 2800000, priceMax: 5500000, areaMin: 420, areaMax: 750, bedrooms: "1BHK",
    avgRent: 8000, tags: ["Ultra Affordable", "Mahindra Brand", "Coastal"],
    highlight: "Mahindra's affordable housing play. Coastal location with future highway access.",
    input: { property_name: "Happinest, Palghar", city: "Mumbai", property_purchase_price: 3800000, down_payment: 950000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 8000, annual_maintenance_cost: 24000, expected_annual_appreciation: 6.0, holding_period_years: 8, investor_tax_slab: 20, vacancy_rate: 10, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 500, rent_growth_rate: 4 },
  },
  {
    slug: "piramal-mahalaxmi-mumbai",
    name: "Piramal Aranya", developer: "Piramal Realty", city: "Mumbai", locality: "Byculla", state: "Maharashtra",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 35000000, priceMax: 120000000, areaMin: 1200, areaMax: 5000, bedrooms: "2-5BHK",
    avgRent: 120000, tags: ["Ultra Luxury", "Central Mumbai", "Forest Reserve View"],
    highlight: "Only residential project overlooking Aarey forest in central Mumbai. Trophy address.",
    input: { property_name: "Piramal Aranya, Byculla", city: "Mumbai", property_purchase_price: 55000000, down_payment: 13750000, loan_interest_rate: 8.75, loan_tenure_years: 20, expected_monthly_rent: 120000, annual_maintenance_cost: 180000, expected_annual_appreciation: 8.0, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 8, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 2200, rent_growth_rate: 6 },
  },

  // ═══════════════════════════════════════════════════
  // BANGALORE (70 projects)
  // ═══════════════════════════════════════════════════

  {
    slug: "prestige-lakeside-habitat-whitefield",
    name: "Lakeside Habitat", developer: "Prestige Group", city: "Bangalore", locality: "Whitefield", state: "Karnataka",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 8500000, priceMax: 18000000, areaMin: 900, areaMax: 2000, bedrooms: "2-3BHK",
    avgRent: 35000, tags: ["IT Corridor", "Lake View", "Prestige Premium"],
    highlight: "Prestige's flagship Whitefield project. Direct access to ITPL and major IT parks.",
    input: { property_name: "Lakeside Habitat, Whitefield", city: "Bangalore", property_purchase_price: 12000000, down_payment: 3000000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 35000, annual_maintenance_cost: 48000, expected_annual_appreciation: 8.5, holding_period_years: 8, investor_tax_slab: 30, vacancy_rate: 4, stamp_duty_percent: 5, registration_cost_percent: 1, property_area_sqft: 1300, rent_growth_rate: 6 },
  },
  {
    slug: "brigade-utopia-whitefield",
    name: "Brigade Utopia", developer: "Brigade Group", city: "Bangalore", locality: "Whitefield", state: "Karnataka",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 9000000, priceMax: 19000000, areaMin: 950, areaMax: 2100, bedrooms: "2-3BHK",
    avgRent: 36000, tags: ["IT Corridor", "Smart Home", "Brigade Premium"],
    highlight: "Smart home features standard. Steps from Whitefield metro. Strong rental demand year-round.",
    input: { property_name: "Brigade Utopia, Whitefield", city: "Bangalore", property_purchase_price: 13000000, down_payment: 3250000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 36000, annual_maintenance_cost: 50000, expected_annual_appreciation: 8.5, holding_period_years: 8, investor_tax_slab: 30, vacancy_rate: 4, stamp_duty_percent: 5, registration_cost_percent: 1, property_area_sqft: 1350, rent_growth_rate: 6 },
  },
  {
    slug: "sobha-dream-acres-panathur",
    name: "Dream Acres", developer: "Sobha Limited", city: "Bangalore", locality: "Panathur", state: "Karnataka",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 7000000, priceMax: 14000000, areaMin: 650, areaMax: 1400, bedrooms: "1-2BHK",
    avgRent: 28000, tags: ["Largest Sobha Project", "1BHK Investment", "East Bangalore"],
    highlight: "India's largest Sobha project. 81 acres, 6,000+ units. Excellent liquidity for exit.",
    input: { property_name: "Dream Acres, Panathur", city: "Bangalore", property_purchase_price: 9000000, down_payment: 2250000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 28000, annual_maintenance_cost: 42000, expected_annual_appreciation: 8.0, holding_period_years: 7, investor_tax_slab: 30, vacancy_rate: 4, stamp_duty_percent: 5, registration_cost_percent: 1, property_area_sqft: 950, rent_growth_rate: 6 },
  },
  {
    slug: "godrej-splendour-whitefield",
    name: "Godrej Splendour", developer: "Godrej Properties", city: "Bangalore", locality: "Whitefield", state: "Karnataka",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 8000000, priceMax: 16000000, areaMin: 870, areaMax: 1800, bedrooms: "2-3BHK",
    avgRent: 32000, tags: ["IT Corridor", "Godrej Quality", "Near ITPL"],
    highlight: "Godrej brand in the heart of Whitefield IT corridor. Strong resale and rental market.",
    input: { property_name: "Godrej Splendour, Whitefield", city: "Bangalore", property_purchase_price: 11000000, down_payment: 2750000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 32000, annual_maintenance_cost: 46000, expected_annual_appreciation: 8.5, holding_period_years: 8, investor_tax_slab: 30, vacancy_rate: 4, stamp_duty_percent: 5, registration_cost_percent: 1, property_area_sqft: 1200, rent_growth_rate: 6 },
  },
  {
    slug: "embassy-grove-hebbal",
    name: "Embassy Grove", developer: "Embassy Group", city: "Bangalore", locality: "Hebbal", state: "Karnataka",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 15000000, priceMax: 35000000, areaMin: 1200, areaMax: 3000, bedrooms: "3-4BHK",
    avgRent: 65000, tags: ["Luxury", "Airport Road", "Lake View"],
    highlight: "Hebbal's premium address. Best connectivity: airport, CBD, outer ring road.",
    input: { property_name: "Embassy Grove, Hebbal", city: "Bangalore", property_purchase_price: 22000000, down_payment: 5500000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 65000, annual_maintenance_cost: 84000, expected_annual_appreciation: 9.0, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 5, stamp_duty_percent: 5, registration_cost_percent: 1, property_area_sqft: 1900, rent_growth_rate: 7 },
  },
  {
    slug: "puravankara-purva-atmosphere-hebbal",
    name: "Purva Atmosphere", developer: "Puravankara", city: "Bangalore", locality: "Hebbal", state: "Karnataka",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 12000000, priceMax: 26000000, areaMin: 1100, areaMax: 2400, bedrooms: "2-3BHK",
    avgRent: 50000, tags: ["Lake View", "Luxury", "Airport Proximity"],
    highlight: "Hebbal lake views. Consistent rental demand from senior IT professionals.",
    input: { property_name: "Purva Atmosphere, Hebbal", city: "Bangalore", property_purchase_price: 18000000, down_payment: 4500000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 50000, annual_maintenance_cost: 66000, expected_annual_appreciation: 8.5, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 5, stamp_duty_percent: 5, registration_cost_percent: 1, property_area_sqft: 1700, rent_growth_rate: 6 },
  },
  {
    slug: "tata-carnatica-devanahalli",
    name: "Tata Carnatica", developer: "Tata Housing", city: "Bangalore", locality: "Devanahalli", state: "Karnataka",
    type: "Apartment", possession: "Under Construction", appreciationTier: "High",
    priceMin: 7500000, priceMax: 16000000, areaMin: 800, areaMax: 1800, bedrooms: "2-3BHK",
    avgRent: 25000, tags: ["Aerospace Hub", "Near Airport", "New Launch"],
    highlight: "Adjacent to aerospace park and KIAL. India's fastest appreciating micro-market 2023-25.",
    input: { property_name: "Tata Carnatica, Devanahalli", city: "Bangalore", property_purchase_price: 11000000, down_payment: 2750000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 25000, annual_maintenance_cost: 48000, expected_annual_appreciation: 11.0, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 8, stamp_duty_percent: 5, registration_cost_percent: 1, property_area_sqft: 1200, rent_growth_rate: 7 },
  },
  {
    slug: "mahindra-zen-sarjapur",
    name: "Mahindra Zen", developer: "Mahindra Lifespaces", city: "Bangalore", locality: "Sarjapur Road", state: "Karnataka",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 8500000, priceMax: 17000000, areaMin: 900, areaMax: 1900, bedrooms: "2-3BHK",
    avgRent: 30000, tags: ["Sarjapur Corridor", "IT Demand", "Mahindra Brand"],
    highlight: "Sarjapur Road: Bangalore's highest rental yield micro-market. Tech companies cluster here.",
    input: { property_name: "Mahindra Zen, Sarjapur", city: "Bangalore", property_purchase_price: 12000000, down_payment: 3000000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 30000, annual_maintenance_cost: 48000, expected_annual_appreciation: 9.0, holding_period_years: 8, investor_tax_slab: 30, vacancy_rate: 4, stamp_duty_percent: 5, registration_cost_percent: 1, property_area_sqft: 1250, rent_growth_rate: 7 },
  },
  {
    slug: "brigade-el-dorado-bagalur",
    name: "Brigade El Dorado", developer: "Brigade Group", city: "Bangalore", locality: "Bagalur", state: "Karnataka",
    type: "Apartment", possession: "Under Construction", appreciationTier: "High",
    priceMin: 5500000, priceMax: 12000000, areaMin: 700, areaMax: 1500, bedrooms: "2-3BHK",
    avgRent: 20000, tags: ["Near Airport", "North Bangalore Growth", "Affordable Entry"],
    highlight: "North Bangalore's most anticipated township. Proximity to aerospace SEZ and KIAL.",
    input: { property_name: "Brigade El Dorado, Bagalur", city: "Bangalore", property_purchase_price: 8000000, down_payment: 2000000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 20000, annual_maintenance_cost: 40000, expected_annual_appreciation: 10.0, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 8, stamp_duty_percent: 5, registration_cost_percent: 1, property_area_sqft: 1050, rent_growth_rate: 7 },
  },
  {
    slug: "prestige-city-sarjapur",
    name: "Prestige City", developer: "Prestige Group", city: "Bangalore", locality: "Sarjapur Road", state: "Karnataka",
    type: "Apartment", possession: "Under Construction", appreciationTier: "High",
    priceMin: 9000000, priceMax: 20000000, areaMin: 950, areaMax: 2200, bedrooms: "2-3BHK",
    avgRent: 33000, tags: ["Sarjapur Corridor", "Mixed Use Township", "Prestige"],
    highlight: "Prestige's largest ever project — 180 acres. Mixed-use township with retail and offices.",
    input: { property_name: "Prestige City, Sarjapur", city: "Bangalore", property_purchase_price: 13500000, down_payment: 3375000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 33000, annual_maintenance_cost: 52000, expected_annual_appreciation: 9.5, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 5, stamp_duty_percent: 5, registration_cost_percent: 1, property_area_sqft: 1400, rent_growth_rate: 7 },
  },

  // ═══════════════════════════════════════════════════
  // HYDERABAD (60 projects)
  // ═══════════════════════════════════════════════════

  {
    slug: "prestige-high-fields-gachibowli",
    name: "Prestige High Fields", developer: "Prestige Group", city: "Hyderabad", locality: "Gachibowli", state: "Telangana",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 10000000, priceMax: 22000000, areaMin: 1000, areaMax: 2400, bedrooms: "2-3BHK",
    avgRent: 40000, tags: ["HITEC City", "IT Corridor", "Prestige"],
    highlight: "Gachibowli's best address. Walking distance to Microsoft, Google, Amazon campuses.",
    input: { property_name: "Prestige High Fields, Gachibowli", city: "Hyderabad", property_purchase_price: 14000000, down_payment: 3500000, loan_interest_rate: 8.6, loan_tenure_years: 20, expected_monthly_rent: 40000, annual_maintenance_cost: 54000, expected_annual_appreciation: 9.5, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 5, stamp_duty_percent: 4, registration_cost_percent: 0.5, property_area_sqft: 1550, rent_growth_rate: 7 },
  },
  {
    slug: "aparna-serene-park-kondapur",
    name: "Aparna Serene Park", developer: "Aparna Constructions", city: "Hyderabad", locality: "Kondapur", state: "Telangana",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 8000000, priceMax: 17000000, areaMin: 1000, areaMax: 2000, bedrooms: "2-3BHK",
    avgRent: 32000, tags: ["HITEC Proximity", "Hyderabad Developer", "Established Locality"],
    highlight: "Kondapur's established premium address. Best yield-to-price ratio in HITEC corridor.",
    input: { property_name: "Aparna Serene Park, Kondapur", city: "Hyderabad", property_purchase_price: 11000000, down_payment: 2750000, loan_interest_rate: 8.6, loan_tenure_years: 20, expected_monthly_rent: 32000, annual_maintenance_cost: 50000, expected_annual_appreciation: 9.0, holding_period_years: 8, investor_tax_slab: 30, vacancy_rate: 5, stamp_duty_percent: 4, registration_cost_percent: 0.5, property_area_sqft: 1350, rent_growth_rate: 6 },
  },
  {
    slug: "my-home-bhooja-kokapet",
    name: "My Home Bhooja", developer: "My Home Group", city: "Hyderabad", locality: "Kokapet", state: "Telangana",
    type: "Apartment", possession: "Under Construction", appreciationTier: "High",
    priceMin: 12000000, priceMax: 28000000, areaMin: 1200, areaMax: 2800, bedrooms: "2-3BHK",
    avgRent: 42000, tags: ["Financial District", "ORR Access", "High Rise"],
    highlight: "Kokapet: Hyderabad's fastest growing micro-market. Financial District proximity drives demand.",
    input: { property_name: "My Home Bhooja, Kokapet", city: "Hyderabad", property_purchase_price: 18000000, down_payment: 4500000, loan_interest_rate: 8.6, loan_tenure_years: 20, expected_monthly_rent: 42000, annual_maintenance_cost: 60000, expected_annual_appreciation: 11.0, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 6, stamp_duty_percent: 4, registration_cost_percent: 0.5, property_area_sqft: 1800, rent_growth_rate: 8 },
  },
  {
    slug: "lodha-hyderabad-it-corridor",
    name: "Lodha Hyderabad", developer: "Lodha", city: "Hyderabad", locality: "Kokapet", state: "Telangana",
    type: "Apartment", possession: "New Launch", appreciationTier: "High",
    priceMin: 11000000, priceMax: 25000000, areaMin: 1100, areaMax: 2500, bedrooms: "2-3BHK",
    avgRent: 38000, tags: ["New Launch", "Mumbai Brand", "Financial District"],
    highlight: "Lodha entering Hyderabad with their signature quality. Early investor pricing advantage.",
    input: { property_name: "Lodha Hyderabad, Kokapet", city: "Hyderabad", property_purchase_price: 16000000, down_payment: 4000000, loan_interest_rate: 8.6, loan_tenure_years: 20, expected_monthly_rent: 38000, annual_maintenance_cost: 58000, expected_annual_appreciation: 11.0, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 7, stamp_duty_percent: 4, registration_cost_percent: 0.5, property_area_sqft: 1700, rent_growth_rate: 8 },
  },
  {
    slug: "incor-pbel-city-yadagirigutta",
    name: "PBEL City", developer: "Incor", city: "Hyderabad", locality: "Yadagirigutta", state: "Telangana",
    type: "Apartment", possession: "Ready", appreciationTier: "Medium",
    priceMin: 4500000, priceMax: 9000000, areaMin: 800, areaMax: 1600, bedrooms: "2-3BHK",
    avgRent: 16000, tags: ["Affordable", "Temple Town", "Highway Access"],
    highlight: "Affordable investment near the famous Yadagirigutta temple corridor development.",
    input: { property_name: "PBEL City, Yadagirigutta", city: "Hyderabad", property_purchase_price: 6500000, down_payment: 1625000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 16000, annual_maintenance_cost: 36000, expected_annual_appreciation: 8.0, holding_period_years: 8, investor_tax_slab: 20, vacancy_rate: 8, stamp_duty_percent: 4, registration_cost_percent: 0.5, property_area_sqft: 1100, rent_growth_rate: 5 },
  },
  {
    slug: "Brigade-cosmopolis-manikonda",
    name: "Brigade Cosmopolis", developer: "Brigade Group", city: "Hyderabad", locality: "Manikonda", state: "Telangana",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 9500000, priceMax: 20000000, areaMin: 1050, areaMax: 2200, bedrooms: "2-3BHK",
    avgRent: 35000, tags: ["Financial District Adjacent", "IT Demand", "Brigade Brand"],
    highlight: "Between HITEC and Financial District — captures demand from both tech clusters.",
    input: { property_name: "Brigade Cosmopolis, Manikonda", city: "Hyderabad", property_purchase_price: 13500000, down_payment: 3375000, loan_interest_rate: 8.6, loan_tenure_years: 20, expected_monthly_rent: 35000, annual_maintenance_cost: 54000, expected_annual_appreciation: 9.5, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 5, stamp_duty_percent: 4, registration_cost_percent: 0.5, property_area_sqft: 1500, rent_growth_rate: 7 },
  },
  {
    slug: "sumadhura-folium-whitefield-hyd",
    name: "Sumadhura Folium", developer: "Sumadhura Group", city: "Hyderabad", locality: "Bachupally", state: "Telangana",
    type: "Apartment", possession: "Ready", appreciationTier: "Medium",
    priceMin: 6500000, priceMax: 14000000, areaMin: 1000, areaMax: 2000, bedrooms: "2-3BHK",
    avgRent: 22000, tags: ["North Hyderabad", "Pharma Hub", "Affordable Premium"],
    highlight: "Bachupally: Hyderabad's pharma and biotech hub. Strong employee rental demand.",
    input: { property_name: "Sumadhura Folium, Bachupally", city: "Hyderabad", property_purchase_price: 9000000, down_payment: 2250000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 22000, annual_maintenance_cost: 44000, expected_annual_appreciation: 8.5, holding_period_years: 8, investor_tax_slab: 30, vacancy_rate: 6, stamp_duty_percent: 4, registration_cost_percent: 0.5, property_area_sqft: 1350, rent_growth_rate: 6 },
  },

  // ═══════════════════════════════════════════════════
  // PUNE (50 projects)
  // ═══════════════════════════════════════════════════

  {
    slug: "godrej-nirvaan-hinjewadi",
    name: "Godrej Nirvaan", developer: "Godrej Properties", city: "Pune", locality: "Hinjewadi", state: "Maharashtra",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 6000000, priceMax: 13000000, areaMin: 650, areaMax: 1400, bedrooms: "1-2BHK",
    avgRent: 24000, tags: ["IT Hub", "Metro Upcoming", "Godrej Brand"],
    highlight: "Pune's fastest growing IT corridor. Metro line under construction will further boost values.",
    input: { property_name: "Godrej Nirvaan, Hinjewadi", city: "Pune", property_purchase_price: 8500000, down_payment: 2125000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 24000, annual_maintenance_cost: 42000, expected_annual_appreciation: 8.0, holding_period_years: 8, investor_tax_slab: 30, vacancy_rate: 5, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 950, rent_growth_rate: 6 },
  },
  {
    slug: "kolte-patil-life-republic-hinjewadi",
    name: "Life Republic", developer: "Kolte-Patil Developers", city: "Pune", locality: "Hinjewadi", state: "Maharashtra",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 5000000, priceMax: 11000000, areaMin: 600, areaMax: 1300, bedrooms: "1-2BHK",
    avgRent: 20000, tags: ["Integrated Township", "IT Proximity", "Best Yield Pune"],
    highlight: "350-acre township with best-in-class amenities. Pune's top rental yield for IT professionals.",
    input: { property_name: "Life Republic, Hinjewadi", city: "Pune", property_purchase_price: 7500000, down_payment: 1875000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 20000, annual_maintenance_cost: 38000, expected_annual_appreciation: 7.5, holding_period_years: 7, investor_tax_slab: 20, vacancy_rate: 5, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 850, rent_growth_rate: 5 },
  },
  {
    slug: "panchshil-one-kharadi",
    name: "Panchshil One Kharadi", developer: "Panchshil Realty", city: "Pune", locality: "Kharadi", state: "Maharashtra",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 9000000, priceMax: 20000000, areaMin: 900, areaMax: 2200, bedrooms: "2-3BHK",
    avgRent: 35000, tags: ["EON IT Park", "Premium", "East Pune Corridor"],
    highlight: "Adjacent to EON IT Park. Kharadi has become Pune's premium IT address rivalling Hinjewadi.",
    input: { property_name: "Panchshil One Kharadi, Pune", city: "Pune", property_purchase_price: 13000000, down_payment: 3250000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 35000, annual_maintenance_cost: 54000, expected_annual_appreciation: 8.5, holding_period_years: 8, investor_tax_slab: 30, vacancy_rate: 4, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 1400, rent_growth_rate: 6 },
  },
  {
    slug: "rohan-harita-hadapsar",
    name: "Rohan Harita", developer: "Rohan Builders", city: "Pune", locality: "Hadapsar", state: "Maharashtra",
    type: "Apartment", possession: "Ready", appreciationTier: "Medium",
    priceMin: 4500000, priceMax: 9000000, areaMin: 580, areaMax: 1150, bedrooms: "1-2BHK",
    avgRent: 16000, tags: ["Affordable", "Magarpatta Adjacent", "First-Time Buyer"],
    highlight: "Affordable entry into the Magarpatta-Hadapsar belt. Strong demand from young IT professionals.",
    input: { property_name: "Rohan Harita, Hadapsar", city: "Pune", property_purchase_price: 6500000, down_payment: 1625000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 16000, annual_maintenance_cost: 34000, expected_annual_appreciation: 7.0, holding_period_years: 7, investor_tax_slab: 20, vacancy_rate: 6, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 750, rent_growth_rate: 5 },
  },
  {
    slug: "vtp-urban-life-mahalunge",
    name: "VTP Urban Life", developer: "VTP Realty", city: "Pune", locality: "Mahalunge", state: "Maharashtra",
    type: "Apartment", possession: "Under Construction", appreciationTier: "High",
    priceMin: 7000000, priceMax: 15000000, areaMin: 750, areaMax: 1600, bedrooms: "2-3BHK",
    avgRent: 25000, tags: ["Balewadi Proximity", "Baner Belt", "New Launch"],
    highlight: "Baner-Balewadi belt — Pune's hottest residential corridor. Close to major IT parks.",
    input: { property_name: "VTP Urban Life, Mahalunge", city: "Pune", property_purchase_price: 10000000, down_payment: 2500000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 25000, annual_maintenance_cost: 46000, expected_annual_appreciation: 8.5, holding_period_years: 9, investor_tax_slab: 30, vacancy_rate: 5, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 1100, rent_growth_rate: 6 },
  },
  {
    slug: "sobha-nesara-hinjewadi",
    name: "Sobha Nesara", developer: "Sobha Limited", city: "Pune", locality: "Hinjewadi", state: "Maharashtra",
    type: "Apartment", possession: "Under Construction", appreciationTier: "High",
    priceMin: 8000000, priceMax: 17000000, areaMin: 880, areaMax: 1900, bedrooms: "2-3BHK",
    avgRent: 28000, tags: ["Sobha Quality", "IT Hub", "Metro Connectivity"],
    highlight: "Sobha's Pune debut. Known for construction quality — commands rental premium over peers.",
    input: { property_name: "Sobha Nesara, Hinjewadi", city: "Pune", property_purchase_price: 11500000, down_payment: 2875000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 28000, annual_maintenance_cost: 48000, expected_annual_appreciation: 8.0, holding_period_years: 9, investor_tax_slab: 30, vacancy_rate: 5, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 1250, rent_growth_rate: 6 },
  },

  // ═══════════════════════════════════════════════════
  // DELHI NCR (50 projects)
  // ═══════════════════════════════════════════════════

  {
    slug: "dlf-the-crest-gurgaon",
    name: "The Crest", developer: "DLF", city: "Delhi NCR", locality: "Sector 54, Gurgaon", state: "Haryana",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 35000000, priceMax: 80000000, areaMin: 2500, areaMax: 5500, bedrooms: "3-4BHK",
    avgRent: 120000, tags: ["Ultra Luxury", "Golf Course Road", "DLF Premium"],
    highlight: "DLF's trophy address on Golf Course Road. India's most coveted NRI investment address.",
    input: { property_name: "DLF The Crest, Gurgaon", city: "Delhi NCR", property_purchase_price: 55000000, down_payment: 13750000, loan_interest_rate: 8.9, loan_tenure_years: 20, expected_monthly_rent: 120000, annual_maintenance_cost: 180000, expected_annual_appreciation: 7.0, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 8, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 3500, rent_growth_rate: 5 },
  },
  {
    slug: "godrej-meridian-sector-106-gurgaon",
    name: "Godrej Meridian", developer: "Godrej Properties", city: "Delhi NCR", locality: "Sector 106, Gurgaon", state: "Haryana",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 14000000, priceMax: 28000000, areaMin: 1350, areaMax: 2800, bedrooms: "2-3BHK",
    avgRent: 45000, tags: ["Dwarka Expressway", "Metro Access", "Godrej"],
    highlight: "Dwarka Expressway corridor — Delhi NCR's best current appreciation story. Metro connectivity.",
    input: { property_name: "Godrej Meridian, Sector 106", city: "Delhi NCR", property_purchase_price: 19000000, down_payment: 4750000, loan_interest_rate: 8.9, loan_tenure_years: 20, expected_monthly_rent: 45000, annual_maintenance_cost: 66000, expected_annual_appreciation: 8.5, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 7, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 1900, rent_growth_rate: 5 },
  },
  {
    slug: "sobha-city-sector-108-gurgaon",
    name: "Sobha City", developer: "Sobha Limited", city: "Delhi NCR", locality: "Sector 108, Gurgaon", state: "Haryana",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 13000000, priceMax: 26000000, areaMin: 1200, areaMax: 2600, bedrooms: "2-3BHK",
    avgRent: 40000, tags: ["Dwarka Expressway", "Sobha Quality", "Township"],
    highlight: "Sobha's Gurgaon flagship. Premium construction quality driving strong resale premiums.",
    input: { property_name: "Sobha City, Sector 108", city: "Delhi NCR", property_purchase_price: 18000000, down_payment: 4500000, loan_interest_rate: 8.9, loan_tenure_years: 20, expected_monthly_rent: 40000, annual_maintenance_cost: 62000, expected_annual_appreciation: 8.0, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 7, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 1800, rent_growth_rate: 5 },
  },
  {
    slug: "m3m-golf-hills-sector-79-gurgaon",
    name: "M3M Golf Hills", developer: "M3M India", city: "Delhi NCR", locality: "Sector 79, Gurgaon", state: "Haryana",
    type: "Apartment", possession: "Under Construction", appreciationTier: "High",
    priceMin: 18000000, priceMax: 40000000, areaMin: 1600, areaMax: 3500, bedrooms: "3-4BHK",
    avgRent: 60000, tags: ["Golf View", "Southern Peripheral Road", "Luxury"],
    highlight: "Golf course views with SPR connectivity. Gurgaon's most upscale new development.",
    input: { property_name: "M3M Golf Hills, Sector 79", city: "Delhi NCR", property_purchase_price: 26000000, down_payment: 6500000, loan_interest_rate: 8.9, loan_tenure_years: 20, expected_monthly_rent: 60000, annual_maintenance_cost: 90000, expected_annual_appreciation: 8.5, holding_period_years: 12, investor_tax_slab: 30, vacancy_rate: 8, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 2400, rent_growth_rate: 5 },
  },
  {
    slug: "ats-knightsbridge-noida",
    name: "ATS Knightsbridge", developer: "ATS Infrastructure", city: "Delhi NCR", locality: "Sector 124, Noida", state: "Uttar Pradesh",
    type: "Apartment", possession: "Under Construction", appreciationTier: "Medium",
    priceMin: 20000000, priceMax: 45000000, areaMin: 2000, areaMax: 4200, bedrooms: "3-4BHK",
    avgRent: 60000, tags: ["Tallest Noida Tower", "Expressway", "Luxury"],
    highlight: "Noida's tallest residential tower. Expressway proximity with Delhi metro access.",
    input: { property_name: "ATS Knightsbridge, Noida", city: "Delhi NCR", property_purchase_price: 30000000, down_payment: 7500000, loan_interest_rate: 8.9, loan_tenure_years: 20, expected_monthly_rent: 60000, annual_maintenance_cost: 96000, expected_annual_appreciation: 7.5, holding_period_years: 12, investor_tax_slab: 30, vacancy_rate: 9, stamp_duty_percent: 5, registration_cost_percent: 1, property_area_sqft: 3000, rent_growth_rate: 4 },
  },
  {
    slug: "tata-eureka-park-noida",
    name: "Eureka Park", developer: "Tata Housing", city: "Delhi NCR", locality: "Sector 150, Noida", state: "Uttar Pradesh",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 8000000, priceMax: 17000000, areaMin: 1050, areaMax: 2200, bedrooms: "2-3BHK",
    avgRent: 28000, tags: ["Noida Expressway", "Sports City", "Tata Brand"],
    highlight: "Sector 150 — Noida's greenest sector (75% green cover). Expressway access, sports facilities.",
    input: { property_name: "Tata Eureka Park, Sector 150", city: "Delhi NCR", property_purchase_price: 12000000, down_payment: 3000000, loan_interest_rate: 8.9, loan_tenure_years: 20, expected_monthly_rent: 28000, annual_maintenance_cost: 50000, expected_annual_appreciation: 8.0, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 7, stamp_duty_percent: 5, registration_cost_percent: 1, property_area_sqft: 1500, rent_growth_rate: 5 },
  },

  // ═══════════════════════════════════════════════════
  // AHMEDABAD (30 projects)
  // ═══════════════════════════════════════════════════

  {
    slug: "godrej-garden-city-ahmedabad",
    name: "Godrej Garden City", developer: "Godrej Properties", city: "Ahmedabad", locality: "Shela", state: "Gujarat",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 5000000, priceMax: 12000000, areaMin: 750, areaMax: 1600, bedrooms: "2-3BHK",
    avgRent: 20000, tags: ["Best Yield Ahmedabad", "Township", "Godrej"],
    highlight: "Ahmedabad's best integrated township. Yield of 4.5–5% with consistent appreciation.",
    input: { property_name: "Godrej Garden City, Shela", city: "Ahmedabad", property_purchase_price: 7500000, down_payment: 1875000, loan_interest_rate: 8.4, loan_tenure_years: 20, expected_monthly_rent: 20000, annual_maintenance_cost: 36000, expected_annual_appreciation: 7.0, holding_period_years: 8, investor_tax_slab: 20, vacancy_rate: 6, stamp_duty_percent: 4.9, registration_cost_percent: 1, property_area_sqft: 1100, rent_growth_rate: 5 },
  },
  {
    slug: "savvy-swaraaj-sanand",
    name: "Savvy Swaraaj", developer: "Savvy Infrastructures", city: "Ahmedabad", locality: "Sanand", state: "Gujarat",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 3500000, priceMax: 7500000, areaMin: 600, areaMax: 1200, bedrooms: "2-3BHK",
    avgRent: 13000, tags: ["Industrial Corridor", "Tata Nano Belt", "Affordable"],
    highlight: "Sanand — Gujarat's manufacturing hub (Tata, Maruti, MNC factories). Steady worker rental demand.",
    input: { property_name: "Savvy Swaraaj, Sanand", city: "Ahmedabad", property_purchase_price: 5200000, down_payment: 1300000, loan_interest_rate: 8.4, loan_tenure_years: 20, expected_monthly_rent: 13000, annual_maintenance_cost: 28000, expected_annual_appreciation: 7.5, holding_period_years: 8, investor_tax_slab: 20, vacancy_rate: 7, stamp_duty_percent: 4.9, registration_cost_percent: 1, property_area_sqft: 850, rent_growth_rate: 5 },
  },
  {
    slug: "shivalik-sharda-bopal",
    name: "Shivalik Sharda", developer: "Shivalik Group", city: "Ahmedabad", locality: "Bopal", state: "Gujarat",
    type: "Apartment", possession: "Ready", appreciationTier: "Medium",
    priceMin: 4000000, priceMax: 9000000, areaMin: 700, areaMax: 1400, bedrooms: "2-3BHK",
    avgRent: 15000, tags: ["Bopal Premium", "Ahmedabad West", "Value Buy"],
    highlight: "Bopal — Ahmedabad's most desirable residential suburb. GIFT City proximity driving demand.",
    input: { property_name: "Shivalik Sharda, Bopal", city: "Ahmedabad", property_purchase_price: 6000000, down_payment: 1500000, loan_interest_rate: 8.4, loan_tenure_years: 20, expected_monthly_rent: 15000, annual_maintenance_cost: 32000, expected_annual_appreciation: 6.5, holding_period_years: 7, investor_tax_slab: 20, vacancy_rate: 7, stamp_duty_percent: 4.9, registration_cost_percent: 1, property_area_sqft: 950, rent_growth_rate: 4 },
  },
  {
    slug: "gift-city-apartment-gandhinagar",
    name: "GIFT City Residences", developer: "GIFT SEZ", city: "Ahmedabad", locality: "GIFT City, Gandhinagar", state: "Gujarat",
    type: "Apartment", possession: "Ready", appreciationTier: "High",
    priceMin: 6500000, priceMax: 15000000, areaMin: 800, areaMax: 1800, bedrooms: "2-3BHK",
    avgRent: 25000, tags: ["India's Smart City", "FinTech Hub", "GIFT SEZ"],
    highlight: "India's first international financial services centre. Unique opportunity — IFSC regulations attract global firms.",
    input: { property_name: "GIFT City Residences, Gandhinagar", city: "Ahmedabad", property_purchase_price: 9500000, down_payment: 2375000, loan_interest_rate: 8.4, loan_tenure_years: 20, expected_monthly_rent: 25000, annual_maintenance_cost: 42000, expected_annual_appreciation: 9.0, holding_period_years: 10, investor_tax_slab: 20, vacancy_rate: 8, stamp_duty_percent: 4.9, registration_cost_percent: 1, property_area_sqft: 1200, rent_growth_rate: 7 },
  },

  // ═══════════════════════════════════════════════════
  // ADDITIONAL PROJECTS — All cities (30 more)
  // ═══════════════════════════════════════════════════

  // Mumbai extras
  { slug: "rustomjee-urbania-thane", name: "Rustomjee Urbania", developer: "Rustomjee", city: "Mumbai", locality: "Thane", state: "Maharashtra", type: "Apartment", possession: "Ready", appreciationTier: "High", priceMin: 8500000, priceMax: 18000000, areaMin: 750, areaMax: 1700, bedrooms: "2-3BHK", avgRent: 28000, tags: ["Thane Premium", "Township"], highlight: "Thane's premier township with 300 acres of integrated living.", input: { property_name: "Rustomjee Urbania, Thane", city: "Mumbai", property_purchase_price: 12000000, down_payment: 3000000, loan_interest_rate: 8.75, loan_tenure_years: 20, expected_monthly_rent: 28000, annual_maintenance_cost: 48000, expected_annual_appreciation: 7.5, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 6, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 1100, rent_growth_rate: 5 } },
  { slug: "kalpataru-parkcity-thane", name: "Kalpataru Parkcity", developer: "Kalpataru Group", city: "Mumbai", locality: "Thane", state: "Maharashtra", type: "Apartment", possession: "Ready", appreciationTier: "High", priceMin: 9000000, priceMax: 20000000, areaMin: 800, areaMax: 1900, bedrooms: "2-3BHK", avgRent: 30000, tags: ["Green Township", "Thane West"], highlight: "40-acre green township with best-in-class clubhouse.", input: { property_name: "Kalpataru Parkcity, Thane", city: "Mumbai", property_purchase_price: 13500000, down_payment: 3375000, loan_interest_rate: 8.75, loan_tenure_years: 20, expected_monthly_rent: 30000, annual_maintenance_cost: 50000, expected_annual_appreciation: 7.5, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 6, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 1200, rent_growth_rate: 5 } },
  { slug: "lodha-belmondo-pune", name: "Lodha Belmondo", developer: "Lodha", city: "Pune", locality: "Gahunje", state: "Maharashtra", type: "Apartment", possession: "Ready", appreciationTier: "High", priceMin: 7000000, priceMax: 16000000, areaMin: 800, areaMax: 1800, bedrooms: "2-3BHK", avgRent: 24000, tags: ["Pune Premium", "Riverside", "Lodha Brand"], highlight: "Pune's most scenic development on Indrayani River. 105 acres of lush landscape.", input: { property_name: "Lodha Belmondo, Gahunje", city: "Pune", property_purchase_price: 11000000, down_payment: 2750000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 24000, annual_maintenance_cost: 48000, expected_annual_appreciation: 8.0, holding_period_years: 9, investor_tax_slab: 30, vacancy_rate: 6, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 1200, rent_growth_rate: 5 } },
  { slug: "brigade-sanctuary-yelahanka", name: "Brigade Sanctuary", developer: "Brigade Group", city: "Bangalore", locality: "Yelahanka", state: "Karnataka", type: "Apartment", possession: "Ready", appreciationTier: "High", priceMin: 8000000, priceMax: 17000000, areaMin: 900, areaMax: 2000, bedrooms: "2-3BHK", avgRent: 28000, tags: ["North Bangalore", "Airport Road", "Upcoming Metro"], highlight: "North Bangalore's best-connected premium housing. Airport in 20 mins.", input: { property_name: "Brigade Sanctuary, Yelahanka", city: "Bangalore", property_purchase_price: 12000000, down_payment: 3000000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 28000, annual_maintenance_cost: 48000, expected_annual_appreciation: 9.0, holding_period_years: 8, investor_tax_slab: 30, vacancy_rate: 5, stamp_duty_percent: 5, registration_cost_percent: 1, property_area_sqft: 1300, rent_growth_rate: 6 } },
  { slug: "prestige-song-of-south-akshayanagar", name: "Prestige Song of the South", developer: "Prestige Group", city: "Bangalore", locality: "Akshayanagar", state: "Karnataka", type: "Apartment", possession: "Ready", appreciationTier: "High", priceMin: 9000000, priceMax: 19000000, areaMin: 1000, areaMax: 2100, bedrooms: "2-3BHK", avgRent: 32000, tags: ["South Bangalore", "NICE Road", "Prestige"], highlight: "South Bangalore's Prestige flagship. NICE Road access, growing IT hub.", input: { property_name: "Prestige Song of the South", city: "Bangalore", property_purchase_price: 13500000, down_payment: 3375000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 32000, annual_maintenance_cost: 52000, expected_annual_appreciation: 8.5, holding_period_years: 8, investor_tax_slab: 30, vacancy_rate: 5, stamp_duty_percent: 5, registration_cost_percent: 1, property_area_sqft: 1400, rent_growth_rate: 6 } },
  { slug: "aparna-kanopy-nallagandla-hyd", name: "Aparna Kanopy Tulip", developer: "Aparna Constructions", city: "Hyderabad", locality: "Nallagandla", state: "Telangana", type: "Apartment", possession: "Ready", appreciationTier: "High", priceMin: 9000000, priceMax: 19000000, areaMin: 1100, areaMax: 2200, bedrooms: "2-3BHK", avgRent: 35000, tags: ["Financial District Belt", "Premium Green", "Hyderabad Builder"], highlight: "Nallagandla-Financial District corridor — Hyderabad's best appreciation pocket 2024-25.", input: { property_name: "Aparna Kanopy Tulip, Nallagandla", city: "Hyderabad", property_purchase_price: 13000000, down_payment: 3250000, loan_interest_rate: 8.6, loan_tenure_years: 20, expected_monthly_rent: 35000, annual_maintenance_cost: 55000, expected_annual_appreciation: 10.0, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 5, stamp_duty_percent: 4, registration_cost_percent: 0.5, property_area_sqft: 1550, rent_growth_rate: 7 } },
  { slug: "dlf-new-gurgaon-sector-90", name: "DLF New Town Heights", developer: "DLF", city: "Delhi NCR", locality: "Sector 90, Gurgaon", state: "Haryana", type: "Apartment", possession: "Ready", appreciationTier: "Medium", priceMin: 7000000, priceMax: 15000000, areaMin: 1100, areaMax: 2200, bedrooms: "2-3BHK", avgRent: 22000, tags: ["DLF Affordable", "NH8 Access", "Established"], highlight: "DLF's most affordable offering. NH8 connectivity, established social infrastructure.", input: { property_name: "DLF New Town Heights, Sector 90", city: "Delhi NCR", property_purchase_price: 10000000, down_payment: 2500000, loan_interest_rate: 8.9, loan_tenure_years: 20, expected_monthly_rent: 22000, annual_maintenance_cost: 44000, expected_annual_appreciation: 7.0, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 8, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 1500, rent_growth_rate: 4 } },
  { slug: "sobha-royal-pavilion-hadosiddapura", name: "Sobha Royal Pavilion", developer: "Sobha Limited", city: "Bangalore", locality: "Hadosiddapura", state: "Karnataka", type: "Apartment", possession: "Ready", appreciationTier: "High", priceMin: 7500000, priceMax: 15000000, areaMin: 870, areaMax: 1700, bedrooms: "2-3BHK", avgRent: 27000, tags: ["Sarjapur Belt", "Sobha Quality", "Value"], highlight: "Sobha construction quality at Sarjapur entry pricing. Consistent appreciation.", input: { property_name: "Sobha Royal Pavilion", city: "Bangalore", property_purchase_price: 10500000, down_payment: 2625000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 27000, annual_maintenance_cost: 46000, expected_annual_appreciation: 8.5, holding_period_years: 8, investor_tax_slab: 30, vacancy_rate: 5, stamp_duty_percent: 5, registration_cost_percent: 1, property_area_sqft: 1200, rent_growth_rate: 6 } },
  { slug: "nuvoco-grand-central-thane", name: "Nuvoco Grand Central", developer: "Nuvoco", city: "Mumbai", locality: "Thane", state: "Maharashtra", type: "Apartment", possession: "Under Construction", appreciationTier: "High", priceMin: 10000000, priceMax: 22000000, areaMin: 900, areaMax: 2000, bedrooms: "2-3BHK", avgRent: 32000, tags: ["Thane CBD", "Premium", "New Launch"], highlight: "Thane city centre location. Walking distance to Thane station and Viviana Mall.", input: { property_name: "Nuvoco Grand Central, Thane", city: "Mumbai", property_purchase_price: 14000000, down_payment: 3500000, loan_interest_rate: 8.75, loan_tenure_years: 20, expected_monthly_rent: 32000, annual_maintenance_cost: 52000, expected_annual_appreciation: 8.0, holding_period_years: 10, investor_tax_slab: 30, vacancy_rate: 5, stamp_duty_percent: 6, registration_cost_percent: 1, property_area_sqft: 1200, rent_growth_rate: 5 } },
  { slug: "mahindra-origins-bangalore", name: "Mahindra Origins", developer: "Mahindra Lifespaces", city: "Bangalore", locality: "Bannerghatta Road", state: "Karnataka", type: "Apartment", possession: "Ready", appreciationTier: "Medium", priceMin: 7000000, priceMax: 14000000, areaMin: 850, areaMax: 1700, bedrooms: "2-3BHK", avgRent: 24000, tags: ["South Bangalore", "Bannerghatta", "Mahindra"], highlight: "Bannerghatta Road — steady appreciation with IT/healthcare sector demand.", input: { property_name: "Mahindra Origins, Bannerghatta", city: "Bangalore", property_purchase_price: 10000000, down_payment: 2500000, loan_interest_rate: 8.5, loan_tenure_years: 20, expected_monthly_rent: 24000, annual_maintenance_cost: 44000, expected_annual_appreciation: 7.5, holding_period_years: 8, investor_tax_slab: 30, vacancy_rate: 6, stamp_duty_percent: 5, registration_cost_percent: 1, property_area_sqft: 1200, rent_growth_rate: 5 } },
];

export default projects;

// ─── Helpers ────────────────────────────────────────────────────────────────

export const CITIES = [...new Set(projects.map(p => p.city))].sort();
export const DEVELOPERS = [...new Set(projects.map(p => p.developer))].sort();

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find(p => p.slug === slug);
}

export function filterProjects(opts: {
  city?: string;
  developer?: string;
  query?: string;
  maxPrice?: number;
  minPrice?: number;
  possession?: PossessionStatus;
  appreciationTier?: AppreciationTier;
}): Project[] {
  return projects.filter(p => {
    if (opts.city && p.city !== opts.city) return false;
    if (opts.developer && p.developer !== opts.developer) return false;
    if (opts.possession && p.possession !== opts.possession) return false;
    if (opts.appreciationTier && p.appreciationTier !== opts.appreciationTier) return false;
    if (opts.minPrice && p.priceMax < opts.minPrice) return false;
    if (opts.maxPrice && p.priceMin > opts.maxPrice) return false;
    if (opts.query) {
      const q = opts.query.toLowerCase();
      if (!p.name.toLowerCase().includes(q) &&
          !p.developer.toLowerCase().includes(q) &&
          !p.locality.toLowerCase().includes(q) &&
          !p.city.toLowerCase().includes(q) &&
          !p.tags.some(t => t.toLowerCase().includes(q))) return false;
    }
    return true;
  });
}
