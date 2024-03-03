import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  newUser: Partial<User> = { enabled: false }; // Partial<User> allows us to have an initially incomplete user object
  editingIndex: number | null = null; 
  currentSearch: SearchCriteria = { name: '', role: '' };
  showAddUserForm: boolean = false;
  
  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
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
    console.log("NEW USER",this.newUser);
    this.userService.addUser(this.newUser as User).subscribe({
      next: () => {
        this.loadUsers();
        this.newUser = { enabled: false }; // Reset form
        this.errorMessage = ''; // Clear any error messages
        this.showAddUserForm = false;
      },
      error: () => this.errorMessage = 'Failed to add user'
    });
  }

  updateUser(updatedUser: User) {
    if (!updatedUser.id) return;
    this.userService.updateUser(updatedUser).subscribe({
      next: () => this.loadUsers(), // Reload users to reflect updates
      error: (error) => console.error('Failed to update user', error),
    });
  }

  deleteUser(id: string) {
    this.userService.deleteUser(id).subscribe({
      next: () => this.loadUsers(), // Reload users to reflect deletion
      error: (error) => console.error('Failed to delete user', error),
    });
  }

  searchUsers(criteria: SearchCriteria) {
    this.currentSearch = criteria;
    console.log('Searching for users with criteria:', criteria);
    this.userService.searchUsers(criteria.name, criteria.role).subscribe({
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
/*
  addUserFormSubmit() {
    const newUser: User = {
      name: "",
      role: "",
      enabled: false,
      id: "",
      date: new Date()
    };
  
    // Add the new user to the users array (at the end)
    this.users.push(newUser);
  
    // Reset the newUser object for the next entry and hide the form
    this.newUser = { name: '', role: '', enabled: false }; // Reset newUser
    this.toggleAddUserForm(); // Hide the form after adding
  }*/
}

interface SearchCriteria {
  name: string;
  role: string;
}