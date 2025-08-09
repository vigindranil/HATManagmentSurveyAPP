function formatDateToDDMMYYYY(dateString: string): string {

    if (dateString) {
        const [year, month, day] = dateString.split("-");
        return `${day}-${month}-${year}`;
    } else {
        return "";
    }
    
  }

  export default formatDateToDDMMYYYY;