import { ISkill } from "./ISkill";

export interface IEmployee {
    id: number | null;
    fullName: string;
    email: string;
    phone: number | null;
    contactPreference: string;
    skills: ISkill[];
}