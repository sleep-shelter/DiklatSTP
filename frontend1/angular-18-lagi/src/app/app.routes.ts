import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TemplateFormValidationComponent } from './topics/template-form-validation/template-form-validation.component';
import { ReactiveFormValidationComponent } from './topics/reactive-form-validation/reactive-form-validation.component';

export const routes: Routes = [
    {
        path:'',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path:'login',
        component:LoginComponent
    },
    {
        path:'',
        component:LayoutComponent,
        children:[
            {
                path:'dashboard',
                component:DashboardComponent
            }
        ]
    },
    {
        path: 'templateFormValidation',
        component:TemplateFormValidationComponent
    },
    {
        path: 'reactiveFormValidation',
        component:ReactiveFormValidationComponent
    }
];
