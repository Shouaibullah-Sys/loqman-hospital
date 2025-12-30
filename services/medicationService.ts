// services/medicationService.ts
import { FormMedicine } from "@/types/prescription";

export class MedicationService {
  static async getDynamicMedications(
    diagnosis: string,
    symptoms: string
  ): Promise<FormMedicine[]> {
    try {
      // Use enhanced local medication database
      return this.getLocalMedications(diagnosis, symptoms);
    } catch (error) {
      console.error("Medication service error:", error);
      return this.getFallbackMedications();
    }
  }

  private static getLocalMedications(
    diagnosis: string,
    symptoms: string
  ): FormMedicine[] {
    const combinedText = `${diagnosis} ${symptoms}`.toLowerCase();

    const medicationDatabase: { [key: string]: FormMedicine[] } = {
      "عفونت تنفسی": [
        {
          id: "1",
          medicine: "Amoxicillin",
          dosage: "500 mg",
          form: "capsule",
          frequency: "هر ۸ ساعت",
          duration: "۷ روز",
          route: "oral",
          timing: "after_meal",
          withFood: true,
          instructions: "قبل از غذا مصرف شود",
          notes: "آنتی بیوتیک وسیع الطیف",
          prescriptionId: "",
        },
        {
          id: "2",
          medicine: "Acetaminophen",
          dosage: "500 mg",
          form: "tablet",
          frequency: "هر ۶ ساعت در صورت نیاز",
          duration: "۳ روز",
          route: "oral",
          timing: "after_meal",
          withFood: false,
          instructions: "برای تب و درد",
          notes: "حداکثر ۴ عدد در روز",
          prescriptionId: "",
        },
      ],
      سرفه: [
        {
          id: "1",
          medicine: "Dextromethorphan",
          dosage: "15 mg",
          form: "syrup",
          frequency: "هر ۴ ساعت",
          duration: "۵ روز",
          route: "oral",
          timing: "after_meal",
          withFood: false,
          instructions: "برای سرفه خشک",
          notes: "قبل از خواب مصرف شود",
          prescriptionId: "",
        },
      ],
      فارنژیت: [
        {
          id: "1",
          medicine: "Penicillin V",
          dosage: "500 mg",
          form: "tablet",
          frequency: "هر ۶ ساعت",
          duration: "۱۰ روز",
          route: "oral",
          timing: "before_meal",
          withFood: false,
          instructions: "نیم ساعت قبل از غذا",
          notes: "برای عفونت استرپتوکوکی",
          prescriptionId: "",
        },
      ],
      سردرد: [
        {
          id: "1",
          medicine: "Ibuprofen",
          dosage: "400 mg",
          form: "tablet",
          frequency: "هر ۸ ساعت",
          duration: "۳ روز",
          route: "oral",
          timing: "after_meal",
          withFood: true,
          instructions: "با غذا مصرف شود",
          notes: "برای سردرد و التهاب",
          prescriptionId: "",
        },
      ],
      گاستریت: [
        {
          id: "1",
          medicine: "Omeprazole",
          dosage: "20 mg",
          form: "capsule",
          frequency: "صبح ناشتا",
          duration: "۱۴ روز",
          route: "oral",
          timing: "before_meal",
          withFood: false,
          instructions: "نیم ساعت قبل از صبحانه",
          notes: "کاهنده اسید معده",
          prescriptionId: "",
        },
      ],
      تب: [
        {
          id: "1",
          medicine: "Acetaminophen",
          dosage: "500 mg",
          form: "tablet",
          frequency: "هر ۶ ساعت در صورت نیاز",
          duration: "تا بهبودی",
          route: "oral",
          timing: "after_meal",
          withFood: false,
          instructions: "برای کاهش تب",
          notes: "حداکثر ۴ عدد در روز",
          prescriptionId: "",
        },
      ],
    };

    // Find best matching diagnosis or symptoms
    const matchedKey = Object.keys(medicationDatabase).find((key) =>
      combinedText.includes(key.toLowerCase())
    );

    return matchedKey
      ? medicationDatabase[matchedKey]
      : this.getFallbackMedications();
  }

  private static getFallbackMedications(): FormMedicine[] {
    return [
      {
        id: "general_1",
        medicine: "Acetaminophen",
        dosage: "500 mg",
        form: "tablet",
        frequency: "هر ۶ ساعت در صورت نیاز",
        duration: "۳ روز",
        route: "oral",
        timing: "after_meal",
        withFood: false,
        instructions: "برای درد و تب",
        notes: "حداکثر ۴ عدد در روز",
        prescriptionId: "",
      },
      {
        id: "general_2",
        medicine: "Vitamin C",
        dosage: "500 mg",
        form: "tablet",
        frequency: "روزانه",
        duration: "۷ روز",
        route: "oral",
        timing: "after_meal",
        withFood: true,
        instructions: "تقویت سیستم ایمنی",
        notes: "بعد از غذا مصرف شود",
        prescriptionId: "",
      },
    ];
  }
}
