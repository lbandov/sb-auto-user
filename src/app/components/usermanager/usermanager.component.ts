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
  errorMessage: string = '';
  newUser: Partial<User> = { enabled: false };
  editingIndex: number | null = null; 
  currentSearch: SearchCriteria = { name: '', role: '' };
  showAddUserForm = false;
  isLoading = false;

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

  addUserFormSubmit() {
    if (!this.newUser.name || !this.newUser.role) {
      this.errorMessage = 'Name and role are required';
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
      },
      error: () => this.errorMessage = 'Failed to add user'
    });
  }

  updateUser(updatedUser: User) {
    if (!updatedUser.id) return;
    this.toggleLoading();
    this.userService.updateUser(updatedUser)
    .pipe(finalize(() => this.toggleLoading()))
    .subscribe({
      next: () => this.loadUsers(),
      error: (error) => console.error('Failed to update user', error),
    });
  }

  deleteUser(id: string) {
    this.toggleLoading
    this.userService.deleteUser(id)
    .pipe(finalize(() => this.toggleLoading()))
    .subscribe({
      next: () => this.loadUsers(),
      error: (error) => console.error('Failed to delete user', error),
    });
  }

  searchUsers(criteria: SearchCriteria) {
    this.toggleLoading();
    this.userService.searchUsers(criteria.name, criteria.role)
    .pipe(finalize(() => this.toggleLoading()))
    .subscribe({
      next: (users: User[]) => {
        this.users = users;
      },
      error: (error) => console.error('Failed to search users', error),
    }); 
  }

  cancelEdit(): void {
    this.editingIndex = null;
  }

  startEdit(index: number): void {
    this.editingIndex = index;
  }

  toggleAddUserForm() {
    this.showAddUserForm = !this.showAddUserForm;
  }

  toggleLoading(){
    this.isLoading = !this.isLoading;
  }

  resetAndSearch() {
    this.currentSearch = {name: '', role: ''};
    this.searchUsers(this.currentSearch); 
  }
}

