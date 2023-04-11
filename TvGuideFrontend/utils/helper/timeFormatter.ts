export function removeZeroMinutes(hoursAndMinuteString: string) {
    if(!hoursAndMinuteString) return { hours: "", minutes: "", timeZone: "" };;
    var hoursMinutes = hoursAndMinuteString.split(/[.:" "]/);
    var hours = parseInt(hoursMinutes[0], 10);
    var minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;
    var timeZone = hoursMinutes[2];
    if (minutes === 0) {
        return { hours: hours, minutes: "", timeZone: timeZone };
    } 
    else {
        if (minutes < 10) {
            return { hours: hours + ":", minutes: "0" + minutes, timeZone: timeZone };
        }
        return { hours: hours + ":", minutes: minutes, timeZone: timeZone };
    }
}