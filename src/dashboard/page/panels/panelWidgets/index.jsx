import React, { Component } from "react";
import XColorPicker from "./xcolorpicker";
import XIconPicker from "./xiconpicker";
import XInput from "./xinput";
import XRadio from "./xradio";
import XSelect from "./xselect";
import XSlider from "./xslider";
import XSwitch from "./xswitch";
import XRadioGroup from "./xradiogroup";
import XRadioInput from "./xradioinput";
import XDate from "./xdate";
import XMonth from "./xmonth";
import XEditor from "./xeditor";
import XCodeEditor from "./xcodeeditor";
import XRadioGroupInput from "./xradiogroupinput";
import XFileSrc from "./xfilesrc";
import TheadGroupConfig from "./table/TheadGroupConfig";
import XWarn from "./xwarn";
import XWarns from "./xwarns";
import Warning from "./table/Warning";
import XGauge from "./xgauge";
import XRadioStringInput from "./xradiostringinput";
import XNumberInput from "./xnumberinput";
import XSwitchMap from "./xswitchmap";
import ICardCond from './indexCard/condSetting';
/**
 * 面板基础组件的配置
 */
export default {
    XColorPicker: props => <XColorPicker {...props} />,
    XIconPicker: props => <XIconPicker {...props} />,
    XInput: props => <XInput {...props} />,
    XRadio: props => <XRadio {...props} />,
    XSelect: props => <XSelect {...props} />,
    XSlider: props => <XSlider {...props} />,
    XSwitch: props => <XSwitch {...props} />,
    XRadioGroup: props => <XRadioGroup {...props} />,
    XRadioInput: props => <XRadioInput {...props} />,
    XDate: props => <XDate {...props} />,
    XMonth: props => <XMonth {...props} />,
    XEditor: props => <XEditor {...props} />,
    XCodeEditor: props => <XCodeEditor {...props} />,
    XRadioGroupInput: props => <XRadioGroupInput {...props} />,
    XFileSrc: props => <XFileSrc {...props} />,
    TheadGroupConfig: props => <TheadGroupConfig {...props} />,
    XWarn: props => <XWarn {...props} />,
    XWarns: props => <XWarns {...props} />,
    Warning: props => <Warning {...props} />,
    XGauge: props => <XGauge {...props} />,
    XRadioStringInput: props => <XRadioStringInput {...props} />,
    XNumberInput: props => <XNumberInput {...props} />,
    XSwitchMap: props =><XSwitchMap {...props}/>,
    ICardCond: props =><ICardCond {...props}/>
};
