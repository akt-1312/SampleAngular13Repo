import { FormArray } from "@angular/forms";
import { TForm } from "../shared/strongly-typed.model";


// export type EmployeeFormModel = {
//     fullName: string,
//     email: string,
//     phone: string,
//     contactPreference: string,
//     skills: TForm<SkillFormModel>
//   };

//  export type SkillFormModel = {
//     skillName: string,
//       experienceInYears: number,
//       proficiency: string
//   }

export type EmployeeFormModel = {
  fullName: string,
  emailGroup: TForm<EmailFormModel>,
  phone: string,
  contactPreference: string,
  //skills: TForm<SkillFormModel>
  skills: FormArray
};

export type SkillFormModel = {
  skillName: string,
  experienceInYears: number,
  proficiency: string
};

export type EmailFormModel = {
  email: string,
  confirmEmail: string
};