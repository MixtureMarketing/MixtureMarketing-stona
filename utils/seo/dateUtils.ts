export const parseToIsoDate = (dateStr: string) => {
  if (!dateStr) return new Date().toISOString();
  if (dateStr.includes('-') && (dateStr.includes('T') || dateStr.split('-').length === 3)) {
    return dateStr;
  }

  const months: { [key: string]: string } = {
    stycznia: '01',
    lutego: '02',
    marca: '03',
    kwietnia: '04',
    maja: '05',
    czerwca: '06',
    lipca: '07',
    sierpnia: '08',
    września: '09',
    października: '10',
    listopada: '11',
    grudnia: '12',
  };

  const parts = dateStr.toLowerCase().split(' ');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = months[parts[1]];
    const year = parts[2];
    if (month) return `${year}-${month}-${day}`;
  }
  return dateStr;
};

export const parseReadTime = (readTime: string) => {
  const minutes = parseInt(readTime);
  if (isNaN(minutes)) return undefined;
  return `PT${minutes}M`;
};
