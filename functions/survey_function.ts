export const formatDropdownData = (
    data: any[],
    keyField: string,
    valueField: string
  ) =>
    (data || []).map((item) => {
      let displayValue = '';
      if (item && item[valueField] !== null && item[valueField] !== undefined) {
        if (typeof item[valueField] === 'object' && !Array.isArray(item[valueField])) {
          try {
            displayValue = JSON.stringify(item[valueField]);
            console.warn(`Object found for SelectList item value for keyField: ${keyField}, valueField: ${valueField}, problematic value: ${JSON.stringify(item[valueField])}. Stringifying it.`);
          } catch (e) {
            displayValue = '[Invalid Object]';
            console.error(`Error stringifying object for SelectList item value for keyField: ${keyField}, valueField: ${valueField}`, item[valueField], e);
          }
        } else {
          displayValue = String(item[valueField]);
        }
      }
      return {
        key: String(item[keyField]),
        value: displayValue,
      };
    });


    