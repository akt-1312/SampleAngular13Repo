import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeService } from './employee.service';
import {IEmployee} from './IEmployee'

@Component({
  selector: 'app-list-employee',
  templateUrl: './list-employee.component.html',
  styleUrls: ['./list-employee.component.css']
})
export class ListEmployeeComponent implements OnInit {
  employees!: IEmployee[];

  constructor(private _employeeService: EmployeeService,
              private _router: Router) { }

  ngOnInit(): void {
    this._employeeService.getEmployees().subscribe({
      next: (listEmployees) => this.employees = listEmployees,
      error: (error) => console.log(error),
      //complete: () => console.log('complete')
    });
  }

  editButtonClick(employeeId: number | null){
    this._router.navigate(['/employees/edit', employeeId]);
  }

}
