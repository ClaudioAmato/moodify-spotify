import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserPreferences } from '../interfaces/UserPreferences';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class PreferencesServices {
  UserPreferences: Observable<UserPreferences[]>;
  UserPreferencesCollection: AngularFirestoreCollection<UserPreferences>;

  constructor(private afs: AngularFirestore) {
    // define collection
    this.UserPreferencesCollection = this.afs.collection<UserPreferences>('UserPreferences');
    // get collection data
    this.UserPreferences = this.UserPreferencesCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  // getting all datas
  getAllUsersPreference(): Observable<UserPreferences[]> {
    return this.UserPreferences;
  }

  // getting specific data of a user
  getSpecificUserPreference(id: string): Observable<UserPreferences> {
    return this.UserPreferencesCollection.doc<UserPreferences>(id).valueChanges().pipe(
      take(1),
      map(data => {
        data.id = id;
        return data;
      })
    );
  }

  // create new user preferences
  addUserPreferences(UserData: UserPreferences): Promise<DocumentReference> {
    return this.UserPreferencesCollection.add(UserData);
  }

  // update user preferences
  updatePreferences(UserData: UserPreferences, favGen: string[], hateGen: string[], favSing: string[]): Promise<void> {
    return this.UserPreferencesCollection.doc(UserData.id).update(
      {
        favoriteGenres: favGen,
        hatedGenres: hateGen,
        favoriteSingers: favSing,
      });
  }

  // delete user preferences
  deleteUserPreferences(id: string): Promise<void> {
    return this.UserPreferencesCollection.doc(id).delete();
  }
}