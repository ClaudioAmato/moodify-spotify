import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmojisService {
  startPath = 'assets/emoji/';
  endPath = '.png';
  amused = 'amused';
  angry = 'angry';
  anxious = 'anxious';
  calm = 'calm';
  sad = 'sad';
  energy = 'energy';
  happy = 'happy';
  sensual = 'sensual';

  arrayNameEmoji = [
    this.energy,
    this.amused,
    this.happy,
    this.sensual,
    this.calm,
    this.anxious,
    this.sad,
    this.angry
  ];

  arrayImgEmoji = [
    this.startPath + this.energy + this.endPath,
    this.startPath + this.amused + this.endPath,
    this.startPath + this.happy + this.endPath,
    this.startPath + this.sensual + this.endPath,
    this.startPath + this.calm + this.endPath,
    this.startPath + this.anxious + this.endPath,
    this.startPath + this.sad + this.endPath,
    this.startPath + this.angry + this.endPath
  ];

  arrayEmoji: Array<{ name: string, image: string }> = [];

  constructor() {
    for (let i = 0; i < 8; i++) {
      this.arrayEmoji.push({ name: this.arrayNameEmoji[i], image: this.arrayImgEmoji[i] });
    }
  }

  getEmojiImg(emoji: string) {
    for (let i = 0; i < this.arrayImgEmoji.length; i++) {
      if (this.arrayImgEmoji[i] === emoji) {
        return this.arrayImgEmoji[i];
      }
    }
    return null;
  }

  getArrayEmoji() {
    return this.arrayEmoji;
  }
}
