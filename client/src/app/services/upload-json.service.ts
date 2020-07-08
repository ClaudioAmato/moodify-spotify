import { Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { JsonData } from '../interfaces/JsonData';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UploadJSONService {
  JsonData: Observable<JsonData[]>;
  JsonDataCollection: AngularFirestoreCollection<JsonData>;

  constructor(private afs: AngularFirestore) {
    // define collection
    this.JsonDataCollection = this.afs.collection<JsonData>('JsonData');
    // get collection data
    this.JsonData = this.JsonDataCollection.snapshotChanges().pipe(
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
  getAllUserJSON(): Observable<JsonData[]> {
    return this.JsonData;
  }

  // create new user json
  addJsonData(UserData: JsonData): Promise<DocumentReference> {
    return this.JsonDataCollection.add(UserData);
  }

  // delete user json
  deleteJsonData(id: string): Promise<void> {
    return this.JsonDataCollection.doc(id).delete();
  }
}
