require('dotenv').config();
const mongoose = require('mongoose');
const { Procedure } = require('./src/models');

const procedures = [
  { name: 'Blood Pressure Check', standardPrice: 1000, category: 'Vital Signs', description: 'Standard blood pressure measurement' },
  { name: 'Blood Sugar Test', standardPrice: 1500, category: 'Laboratory', description: 'Fasting blood glucose test' },
  { name: 'ECG (Electrocardiogram)', standardPrice: 8000, category: 'Cardiology', description: 'Heart electrical activity recording' },
  { name: 'X-Ray (Chest)', standardPrice: 12000, category: 'Radiology', description: 'Chest X-ray imaging' },
  { name: 'Ultrasound Scan', standardPrice: 15000, category: 'Radiology', description: 'Abdominal ultrasound' },
  { name: 'Malaria Test', standardPrice: 2000, category: 'Laboratory', description: 'Rapid malaria diagnostic test' },
  { name: 'Typhoid Test', standardPrice: 2500, category: 'Laboratory', description: 'Widal test for typhoid' },
  { name: 'HIV Screening', standardPrice: 3000, category: 'Laboratory', description: 'HIV antibody test' },
  { name: 'Hepatitis B Test', standardPrice: 4000, category: 'Laboratory', description: 'HBsAg screening' },
  { name: 'Complete Blood Count (CBC)', standardPrice: 5000, category: 'Laboratory', description: 'Full blood count analysis' },
  { name: 'Urinalysis', standardPrice: 2000, category: 'Laboratory', description: 'Urine examination' },
  { name: 'Stool Analysis', standardPrice: 2500, category: 'Laboratory', description: 'Stool microscopy and culture' },
  { name: 'Wound Dressing', standardPrice: 3000, category: 'Nursing', description: 'Wound cleaning and dressing' },
  { name: 'Injection (IM/IV)', standardPrice: 1000, category: 'Nursing', description: 'Intramuscular or intravenous injection' },
  { name: 'Suturing (Minor)', standardPrice: 8000, category: 'Surgery', description: 'Minor wound suturing' },
  { name: 'Suturing (Major)', standardPrice: 15000, category: 'Surgery', description: 'Major wound suturing' },
  { name: 'Catheterization', standardPrice: 5000, category: 'Nursing', description: 'Urinary catheter insertion' },
  { name: 'Nebulization', standardPrice: 2000, category: 'Respiratory', description: 'Respiratory therapy treatment' },
  { name: 'Physiotherapy Session', standardPrice: 10000, category: 'Physiotherapy', description: 'Physical therapy session' },
  { name: 'Dental Extraction', standardPrice: 8000, category: 'Dental', description: 'Tooth extraction procedure' },
];

async function seedProcedures() {
  try {
    console.log('🏥 Starting procedure seeding...\n');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB\n');
    
    await Procedure.deleteMany({});
    console.log('✓ Cleared existing procedures');
    
    const createdProcedures = await Procedure.insertMany(procedures);
    console.log(`✓ Created ${createdProcedures.length} procedures\n`);
    
    console.log('Procedures by category:');
    const categories = [...new Set(procedures.map(p => p.category))];
    categories.forEach(category => {
      const count = procedures.filter(p => p.category === category).length;
      console.log(`  - ${category}: ${count} procedures`);
    });
    
    console.log('\n✅ Procedure seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding procedures:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
    process.exit(0);
  }
}

seedProcedures();
