import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  isLoginView: boolean = true;

  userRegisterObj: any ={
    UserName: '',
    password: '',
    emailId: '',
    NamaDepan: '',
    NamaBelakang: '',
  }

  userLogin: any ={
    UserName: '',
    password: '',
  }

  router = inject(Router);

  onRegister() {
    debugger;
    const isLocalData = localStorage.getItem("angular18Local")
    if(isLocalData != null) {
      const localArray = JSON.parse(isLocalData);
      localArray.push(this.userRegisterObj);
      localStorage.setItem("angular18Local", JSON.stringify(localArray))
    } else {
      const localArray = [];
      localArray.push(this.userRegisterObj);
      localStorage.setItem("angular18Local", JSON.stringify(localArray))
    }
    alert("Pendaftaran sukses!");
  }  
  onLogin() {
    debugger;
    const isLocalData = localStorage.getItem("angular18Local");
    if(isLocalData != null) {
      const user = JSON.parse(isLocalData);
      
      const isUserfound = user.find((m:any)=> m.UserName == this.userLogin && m.password  == this.userLogin.password);
      if(isUserfound != undefined) {
        this.router.navigateByUrl('dashboard')
      } else {
        alert("Username atau password salah")
      }
    } else {
      alert("Pengguna tidak ditemukan")
    }

  }

}
