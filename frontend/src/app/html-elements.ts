import { FormControl, Validators, AsyncValidatorFn, 
        ValidatorFn, AbstractControlOptions, FormArray } from '@angular/forms';

declare var $: any;

export interface GenericHtmlButtonInterface {
  form_name: string;
  label: string;
  description: string;
}

/**
 * Contract that enforces properties needed for the /help page.
 */
export interface HelpPageInterface {
  description: string;
  anchor: string;
}

export interface HtmlCheckBoxInterface {
  form_name: string;
  label: string;
  description: string;
  anchor: string;
  disabled: boolean;
  checked: boolean;
}

export interface HtmlDropDownInterface {
  form_name: string;
  label: string;
  options: Array<string>;
  anchor: string;
  description: string;
  default_value: string;
}

export interface HtmlInputInterface {
  form_name: string;
  label: string;
  placeholder: string;
  input_type: string;
  disabled: boolean;
  html5_constraint: string;
  invalid_feedback: string;
  required: boolean;
  default_value: string;
  valid_feedback: string;
  anchor: string;

  setDefaultValue(someValue: string);
}

export interface HtmlCardSelectorInterface {
  form_name: string;
  label: string;
  description: string;
  card_text: string;
  card_notes: string;
  invalid_feedback: string;
  is_multi_select: boolean;
  anchor: string;
}

export enum ModalType {
  general = 1,
  error,
  success
}

export interface HtmlModalPopUpInterface {
  updateModal(title: string, text: string,
    primary_button_text: string, secondary_button_text: string,
    type: ModalType);
  openModal();
  hideModal();
}

export class HtmlModalPopUp implements HtmlModalPopUpInterface {
  private _id: string;
  private _title: string;
  private _text: string;
  private _primary_button_text?: string;
  private _secondary_button_text?: string;
  private _type: ModalType;

  constructor(id: string,
  ) {
    this._id = id;
  }

  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get text(): string {
    return this._text;
  }

  get primary_button_text(): string {
    return this._primary_button_text;
  }

  get secondary_button_text(): string {
    return this._secondary_button_text;
  }

  get type(): ModalType {
    return this._type;
  } 

  updateModal(title: string, text: string,
    primary_button_text: string, secondary_button_text?: string,
    type: ModalType = ModalType.general) {    
    this._title = title;
    this._text = text;
    this._primary_button_text = primary_button_text;
    this._secondary_button_text = secondary_button_text;
    this._type = type;
  }

  openModal() {
    $("#" + this._id).modal('show');
  }

  hideModal() {
    $("#" + this._id).modal('hide');
  }
}

export class HtmlModalSelectDialog extends HtmlModalPopUp {
  private _selection: Object;
  private _isDisabled: boolean;

  constructor(id: string) {
    super(id);
  }

  updateModalSelection(selection: Object, isPrimaryBtnDisabled=true){
    this._selection = selection;
    this._isDisabled = isPrimaryBtnDisabled;    
  }

  get selection(): Object {
    return this._selection;
  }

  set isDisabled(newValue: boolean){
    this._isDisabled = newValue;
  }

  get isDisabled(): boolean {
    return this._isDisabled;
  }
}

export class HtmlCheckBox extends FormControl implements HtmlCheckBoxInterface, HelpPageInterface {
  anchor: string;
  checked: boolean;
  constructor(public form_name: string,
    public label: string,
    public description: string,
    disabled: boolean = false,
    checked: boolean = false
  ) {
    super('', null, null);
    if (disabled) {
      super.disable();
    }

    super.setValue(checked);
    this.checked = checked;
    this.anchor = 'anchor_' + form_name;
  }
}

export class HtmlDropDown extends FormControl implements HtmlDropDownInterface, HelpPageInterface {
  anchor: string;
  constructor(
    public form_name: string,
    public label: string,
    public options: Array<string>,
    public description: string,
    public default_value: string = ''
  ) {
    super('', null, null);
    this.anchor = 'anchor_' + form_name;
    super.setValue(default_value);
  }
}

export class HtmlHidden extends FormControl {

  constructor(public form_name: string, public required: boolean){
    super('', null, null);
    if (required){
      super.setValidators(Validators.required);
    }
  }
}

export class HtmlInput extends FormControl implements HtmlInputInterface, HelpPageInterface {
  anchor: string;
  control_disabled: boolean;

  constructor(public form_name: string,
    public label: string,
    public placeholder: string,
    public input_type: string,
    public html5_constraint: string,
    public invalid_feedback: string,
    public required: boolean,
    public default_value: string,
    public description: string,
    public valid_feedback: string = 'Good to go!',
    disabled: boolean = false,
    public has_button: boolean = false,
    public button_text: string = 'Submit',
    public button_css: string = 'btn btn-primary',
    validatorOrOpts: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null = null, 
    asyncValidator: AsyncValidatorFn | AsyncValidatorFn[] | null = null
  ) {
    super('', validatorOrOpts, asyncValidator);
    let validators = [];
    if (required) {
      validators.push(Validators.required);
    }
    if (html5_constraint) {
      validators.push(Validators.pattern(html5_constraint));
    }
    super.setValidators(validators);
    super.setValue(default_value);

    this.control_disabled = disabled;
    this.anchor = 'anchor_' + this.form_name;
  }

  /**
   * Override for disabling HtmlInputs
   * Angular does not allow users to submit diabled form fields but we need them
   * for form submissions in this application because disabled inputs tend to have 
   * autocaluated values.
   * 
   * @param opts 
   */
  disable(opts?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void {
    this.control_disabled = true;
  }
  
  /**
   * Override for enabling HtmlInputs
   * 
   * @param opts 
   */
  enable(opts?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void{
    this.control_disabled = false;
  }

  setDefaultValue(someValue: string) {
    this.default_value = someValue;
    super.setValue(this.default_value);
  }
}

/**
 * @deprecated - DO not use this.  Use the HtmlCardSelector instead.
 */
export class GenericHtmlButton extends FormControl implements HelpPageInterface, GenericHtmlButtonInterface {
  anchor: string;
  constructor(
    public form_name: string,
    public label: string,
    public description: string,
  ) {
    super('', null, null);
    this.anchor = 'anchor_' + form_name;
  }
}

/**
 * Backing object for a selection box 
 */
export class HtmlCardSelector extends FormArray implements HelpPageInterface, HtmlCardSelectorInterface {
  anchor: string;
  constructor(
    public form_name: string,
    public label: string,
    public description: string,
    public card_text: string,
    public card_notes: string,
    public invalid_feedback: string,
    public is_multi_select: boolean = false,
    public default_selections: Array<string> = []
  ) {
    super([], null, null);
    this.anchor = 'anchor_' + form_name;
  }
}