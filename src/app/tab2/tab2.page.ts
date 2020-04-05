import { GoogleGeolocalization } from './../services/googleGeolocalization.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  get email() {
    return this.registrationForm.get('email');
  }
  get password() {
    return this.registrationForm.get('password');
  }
  get name() {
    return this.registrationForm.get('name');
  }
  get surname() {
    return this.registrationForm.get('surname');
  }
  get age() {
    return this.registrationForm.get('age');
  }
  get sex() {
    return this.registrationForm.get('sex');
  }
  get country() {
    return this.registrationForm.get('country');
  }
  get favGeneres() {
    return this.registrationForm.get('favGeneres');
  }
  get hatedGeneres() {
    return this.registrationForm.get('hatedGeneres');
  }
  get favoriteSingers() {
    return this.registrationForm.get('favoriteSingers');
  }

  public errorMessages = {
    email: [
      { type: 'required', message: 'Name is required' },
      { type: 'maxlenght', message: 'Name can\'t be longer than 100 characters' }
    ],
  };

  registrationForm = this.formBuilder.group({
    email: [''],
    password: [''],
    name: [''],
    surname: [''],
    age: [''],
    sex: [''],
    country: [''],
    favGeneres: [''],
    hatedGeneres: [''],
    favoriteSingers: ['']
  });

  country_name: string;

  constructor(private formBuilder: FormBuilder, private geoLocal: GoogleGeolocalization) { }

  ngOnInit() {
    this.geoLocal.getLocation().subscribe(data => {
      this.country_name = data.country_name;
      console.log(this.country_name);
    });
  }

  public submit() {
    console.log(this.registrationForm.value);
  }

  uploadImage() {

  }
}
