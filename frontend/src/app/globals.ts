//declare var IS_MATRIX_ON: boolean;
declare let window: any;
window.IS_MATRIX_ON = true;

export function SetISMatrix(newValue: boolean){
    window.IS_MATRIX_ON = newValue;
}

export function GetIsMatrix(){
    return window.IS_MATRIX_ON;
}