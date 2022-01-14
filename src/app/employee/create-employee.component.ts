import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomValidators } from '../shared/custom.validators';
import { TForm } from '../shared/strongly-typed.model';
import { EmployeeFormModel, SkillFormModel } from './employee.model';
import { EmployeeService } from './employee.service';
import { IEmployee } from './IEmployee';
import { ISkill } from './ISkill';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent implements OnInit {
  //employeeForm!: FormGroup;

  employeeForm!: TForm<EmployeeFormModel>;
  employee!: IEmployee;
  pageTitle!: string;

  validationMessages = {
    'fullName': {
      'required': 'Full Name is required.',
      'minlength': 'Full Name must be greater than 2 characters.',
      'maxlength': 'Full Name must be less than 10 characters.'
    },
    'email': {
      'required': 'Email is required.',
      'emailDomain': 'Email domain should be pragimtech.com'
    },
    'confirmEmail': {
      'required': 'Confirm Email is required.',
    },
    'emailGroup': {
      'emailMismatch': 'Email and Confirm Email do not match.'
    },
    'phone': {
      'required': 'Phone is required.'
    },
    // 'skillName': {
    //   'required': 'Skill Name is required.'
    // },
    // 'experienceInYears': {
    //   'required': 'Experience is required.'
    // },
    // 'proficiency': {
    //   'required': 'Proficiency is required.'
    // }
  };

  formErrors = {
    'fullName': '',
    'email': '',
    'confirmEmail': '',
    'emailGroup': '',
    'phone': '',
    // 'skillName': '',
    // 'experienceInYears': '',
    // 'proficiency': ''
  };

  constructor(private fb: FormBuilder, private route: ActivatedRoute,
    private employeeService: EmployeeService, private router: Router) { }

  ngOnInit(): void {
    // this.employeeForm = this.fb.group({
    //   fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
    //   email: ['', Validators.required],
    //   phone: [''],
    //   contactPreference: ['email'],
    //   skills: this.fb.group({
    //     skillName: ['', Validators.required],
    //     experienceInYears: ['', Validators.required],
    //     proficiency: ['', Validators.required]
    //   })
    // });

    this.employeeForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
      emailGroup: this.fb.group({
        email: ['', [Validators.required, CustomValidators.emailDomain('pragimtech.com')]],
        confirmEmail: ['', Validators.required],
      }, { validators: CustomValidators.matchEmail }),
      phone: [''],
      contactPreference: ['email'],
      skills: this.fb.array([
        this.addSkillFormGroup()
      ])
    }) as TForm<EmployeeFormModel>;

    this.employeeForm.controls.contactPreference?.valueChanges.subscribe((data: string) => {
      this.onContactPreferenceChange(data);
    });

    this.employeeForm.valueChanges.subscribe((data) => {
      this.logValidationErrors(this.employeeForm);
      //console.log(this.employeeForm?.controls.emailGroup.controls.email?.errors?.['emailDomain'])
      //console.log(this.formErrors);
    });

    this.route.paramMap.subscribe(params => {
      const empId = Number(params.get('id'));
      if (empId && empId > 0) {
        this.pageTitle = 'Edit Employee';
        this.getEmployee(empId);
      }else{
        this.pageTitle = 'Create Employee';
        this.employee = {
          id: null,
          fullName: '',
          contactPreference: '',
          email: '',
          phone: null,
          skills: []
        };
      }
    });
    //console.log(this.formErrors);
  }

  getEmployee(id: number) {
    this.employeeService.getEmployee(id).subscribe({
      next: (emp: IEmployee) => {
        this.editEmployee(emp);
        this.employee = emp;
        //console.log(this.employee);
      },
      error: (error) => console.log(error),

    });
  }

  editEmployee(employee: IEmployee) {
    this.employeeForm.patchValue({
      fullName: employee.fullName,
      contactPreference: employee.contactPreference,
      emailGroup: {
        email: employee.email,
        confirmEmail: employee.email
      },
      phone: employee.phone
    });

    this.employeeForm.setControl('skills', this.setExistingSkills(employee.skills));
  }

  setExistingSkills(skillSets: ISkill[]): FormArray {
    const formArray = new FormArray([]);
    skillSets.forEach(s => {
      formArray.push(this.fb.group({
        skillName: s.skillName,
        experienceInYears: s.experienceInYears,
        proficiency: s.proficiency
      }));
    });
    return formArray;
  }

  removeSkillButtonClick(skillGroupIndex: number): void {
    const skillFormArray = this.employeeForm.controls.skills;
    skillFormArray.removeAt(skillGroupIndex);
    skillFormArray.markAsDirty();
    skillFormArray.markAsTouched();
  }

  addSkillButtonClick(): void {
    (this.employeeForm.controls.skills).push(this.addSkillFormGroup());

  }

  addSkillFormGroup(): FormGroup {
    return this.fb.group({
      skillName: ['', Validators.required],
      experienceInYears: ['', [Validators.required, Validators.min(1), Validators.pattern("^[0-9]*$")]],
      proficiency: ['', Validators.required]
    });
  }

  onContactPreferenceChange(selectedValue: string) {
    const phoneControl = this.employeeForm.controls.phone;
    const emailControl = this.employeeForm.controls.emailGroup.controls.email;
    const confirmEmailControl = this.employeeForm.controls.emailGroup.controls.confirmEmail;
    if (selectedValue === 'phone') {
      phoneControl?.setValidators(Validators.required);
      emailControl?.clearValidators();
      confirmEmailControl?.clearValidators();      
    } else {
      phoneControl?.clearValidators();
      emailControl?.setValidators([Validators.required, CustomValidators.emailDomain('pragimtech.com')]);
      confirmEmailControl?.setValidators(Validators.required);
    }
    phoneControl?.updateValueAndValidity();
    emailControl?.updateValueAndValidity();
    confirmEmailControl?.updateValueAndValidity();
  }

  logValidationErrors(group: FormGroup = this.employeeForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);

      (this.formErrors as any)[key] = '';
      if (abstractControl && !abstractControl.valid &&
        (abstractControl.touched || abstractControl.dirty || abstractControl.value !== '')) {
        const messages = (this.validationMessages as any)[key];
        for (const errorKey in abstractControl.errors) {
          if (errorKey) {
            (this.formErrors as any)[key] += messages[errorKey] + ' ';
          }
        }
      }

      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      }
    });
  }

  onLoadDataClick(): void {
    const formArray = new FormArray([
      new FormControl('John', Validators.required),
      new FormGroup({
        conutry: new FormControl('', Validators.required)
      }),
      new FormArray([])
    ]);
    console.log(formArray.length);
  }

  onSubmit(): void {
    this.mapFormValuesToEmployeeModel();
    if(this.employee.id){
      this.employeeService.updateEmployee(this.employee).subscribe({
        next: () => this.router.navigate(['/employees']),
        error: (error) => console.log(error)
      });
    }else{
      this.employeeService.addEmployee(this.employee).subscribe({
        next: () => this.router.navigate(['/employees']),
        error: (error) => console.log(error)
      });
    }

  }

  mapFormValuesToEmployeeModel() {
    this.employee.fullName = this.employeeForm.value.fullName;
    this.employee.contactPreference = this.employeeForm.value.contactPreference;
    this.employee.email = this.employeeForm.value.emailGroup.email;
    this.employee.phone = this.employeeForm.value.phone;
    this.employee.skills = this.employeeForm.value.skills;

  }

}