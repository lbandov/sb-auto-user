import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { SearchCriteria } from '../../models/searchcriteria.model';

@Component({
  selector: 'app-usermanager',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './usermanager.component.html',
  styleUrl: './usermanager.component.scss'
})
export class UserManagerComponent implements OnInit {
  users: User[] = [];
  currentUser: User | null = null;
  oldUserData: User | null = null;
  errorMessage: string = '';
  newUser: Partial<User> = { enabled: false };
  editingIndex: number | null = null; 
  currentSearch: SearchCriteria = { name: '', role: '', status: 0 };
  showAddUserForm = false;
  isLoading = false;
  showErrorFoxIndex: number | null = null
  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.toggleLoading();
    this.userService.getUsers()
    .pipe(finalize(() => this.toggleLoading()))
    .subscribe({
      next: (users: User[]) => this.users = users,
      error: (err) => {
        console.error('Error fetching users:', err);
        this.errorMessage = 'There was a problem loading the users.';
      }
    });
  }

  addUserFormSubmit(index: number) {
    if (this.isUserInvalid(this.newUser.name, this.newUser.role)) {
      this.errorMessage = 'Name and role are required';
      this.showErrorFoxIndex = index;
      return;
    }

    this.toggleLoading();
    this.userService.addUser(this.newUser as User)
    .pipe(finalize(() => {
      this.toggleLoading();
      this.toggleAddUserForm();
    }))
    .subscribe({
      next: () => {
        this.loadUsers();
        this.newUser = { enabled: false }; // Reset form
        this.errorMessage = ''; // Clear any error messages
        this.showErrorFoxIndex = null
      },
      error: () => this.errorMessage = 'Failed to add user'
    });
  }

  updateUser(updatedUser: User, index: number) {
    if(this.isUserInvalid(updatedUser.name, updatedUser.role)){
      this.errorMessage = "Please enter name and role"
      this.showErrorFoxIndex = index;
      return;
    }

    this.toggleLoading();
    this.userService.updateUser(updatedUser)
    .pipe(finalize(() => {
      this.toggleLoading()
      this.cancelEdit();
      this.errorMessage = '';
      this.showErrorFoxIndex = null
    }))
    .subscribe({
      next: () => {
        const isSearchEmpty = !this.currentSearch.name || !this.currentSearch.role || this.currentSearch.status === 0;
        isSearchEmpty ? this.loadUsers() : this.searchUsers(this.currentSearch);
      },
      error: (error) => console.error('Failed to update user', error),
    });
  }

  deleteUser(id: string) {
    this.toggleLoading();
    this.userService.deleteUser(id)
    .pipe(finalize(() => this.toggleLoading()))
    .subscribe({
      next: () => this.loadUsers(),
      error: (error) => console.error('Failed to delete user', error),
    });
  }

  searchUsers(criteria: SearchCriteria) {
    this.toggleLoading();
    this.userService.searchUsers(criteria.name, criteria.role, criteria.status)
    .pipe(finalize(() => this.toggleLoading()))
    .subscribe({
      next: (users: User[]) => {
        this.users = users;
      },
      error: (error) => console.error('Failed to search users', error),
    }); 
  }

  radioSearch(status: number) {
    this.currentSearch.status = status;
    this.searchUsers(this.currentSearch)
  }

  cancelEdit(isClick: boolean = false): void {
    if(isClick){
      this.users[this.editingIndex as number] = {...this.oldUserData} as User;
    }
    this.editingIndex = null;
    this.showErrorFoxIndex = null;
  }

  startEdit(index: number): void {
    this.oldUserData = {...this.users[index]};
    this.editingIndex = index;
  }

  toggleAddUserForm() {
    this.showAddUserForm = !this.showAddUserForm;
    this.showErrorFoxIndex = null;
  }

  toggleLoading(){
    this.isLoading = !this.isLoading;
  }

  resetAndSearch() {
    this.currentSearch = {name: '', role: '', status: 0};
    this.loadUsers();
  }

  isUserInvalid(name?: string, role?: string): boolean{
    if( !name || !role){
      return true;
    }
    const trimName = name?.trim();
    const trimrole = role?.trim();
    return !trimName || !trimrole;
  }
}

