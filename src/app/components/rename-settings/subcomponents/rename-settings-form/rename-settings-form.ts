import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rename-settings-form',
  imports: [FormsModule],
  templateUrl: './rename-settings-form.html',
  styleUrl: './rename-settings-form.css',
})
export class RenameSettingsForm {
  @Input() title: string = '';
  @Input() year: string = '';
  @Input() edition: string = '';
  @Input() isDisabled: boolean = true;
  @Input() titleError: string = '';
  @Input() yearError: string = '';
  @Input() editionError: string = '';
  @Input() hasMultipleSelectedEditions: boolean = false;

  @Output() titleChange = new EventEmitter<string>();
  @Output() yearChange = new EventEmitter<string>();
  @Output() editionChange = new EventEmitter<string>();
  @Output() inputChanged = new EventEmitter<void>();

  onTitleChange(value: string): void {
    this.titleChange.emit(value);
    this.inputChanged.emit();
  }

  onYearChange(value: string): void {
    this.yearChange.emit(value);
    this.inputChanged.emit();
  }

  onEditionChange(value: string): void {
    this.editionChange.emit(value);
    this.inputChanged.emit();
  }
}
