// Add zero in front of numbers < 10
export function zeroPad(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

// Format day of week for printing
function prettyDate (d){
  var day = new Array();
    day[0] = "Sun";
    day[1] = "Mon";
    day[2] = "Tue";
    day[3] = "Wed";
    day[4] = "Thu";
    day[5] = "Fri";
    day[6] = "Sat";
  return day[d];
}

// Format month for printing
function prettyMonth (m){
  var month = new Array();
    month[0] = "Jan";
    month[1] = "Feb";
    month[2] = "Mar";
    month[3] = "Apr";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "Aug";
    month[8] = "Sept";
    month[9] = "Oct";
    month[10] = "Nov";
    month[11] = "Dec";
  return month[m];
}

// Format full date string for printing
export function formatDate(d){
  let day = prettyDate(d.getDay());
  let month = prettyMonth(d.getMonth());
  let date = zeroPad(d.getDate());
  //let year = d.getFullYear();
  return day + ', ' + month + ' ' + date; // + ' ' + year;
}

// Round any numbers greater than 9999 to nearest thousand with 1 decimal place
export function formatNumber(n){
  if (n <= 999){
    return n;
  }
  else {
   return (Math.round((n/1000) * 10)) / 10 + 'k';
  }
}
