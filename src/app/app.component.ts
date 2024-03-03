import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserManagerComponent } from './components/usermanager/usermanager.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UserManagerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'manage-users';
}
