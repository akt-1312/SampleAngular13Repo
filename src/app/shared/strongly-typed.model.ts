import { AbstractControl, FormArray, FormGroup } from "@angular/forms";

export type FormControls<T> = {
    [key in keyof T]: T[key] extends TForm<any> | FormArray // If control value has type of TForm (nested form) or FormArray
    ? T[key] // Use type that we define in our FormModel
    : Omit<AbstractControl, 'value'> & { value: T[key] } // Or use custom AbstractControl with typed value
};

export type TForm<T> = FormGroup & {
    controls: FormControls<T>;
};