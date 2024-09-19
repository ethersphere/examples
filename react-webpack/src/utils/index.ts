import { BEE_NODE_URL } from "./constant";

const isValidURL = (url: string) => {
  if (typeof url !== "string") {
    return false;
  }

  const urlObj = new URL(url);
  return urlObj.protocol === "https:" || urlObj.protocol === "http:";
};

const removeSlashFromUrl = (url: string) => {
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

const format = {
  parsePlur: (n: number) => {
    return n * 10 ** 16;
  },
  parsexBZZ: (n: number) => {
    return n * 1e18;
  },
  formatPlur: (n: number) => {
    return n / 10 ** 16;
  },
  copyText: async (txt: string) => {
    return new Promise((res, rej) => {
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(txt)
          .then(() => res(true))
          .catch((err) => rej(err));
      } else {
        // fallback
        const txtarea = document.createElement("textarea");
        txtarea.value = txt;
        document.body.appendChild(txtarea);
        txtarea.select();

        try {
          document.execCommand("copy");
          res(true);
        } catch (err) {
          document.removeChild(txtarea);
          rej(err);
        }
      }
    });
  },
  trimText: (txt: string) => {
    return txt.length > 16
      ? txt.slice(0, 10) + "..." + txt.substring(txt.length - 10)
      : txt;
  },
};

function convertBytes(sizeInBytes: number) {
  const KB = sizeInBytes / 1024;
  const MB = KB / 1024;
  const GB = MB / 1024;
  const PB = GB / 1024;

  let unit;
  let value;

  if (PB >= 1) {
    unit = "PB";
    value = KB / 1024;
  } else if (GB >= 1) {
    unit = "GB";
    value = MB / 1024;
  } else if (MB >= 1) {
    unit = "MB";
    value = GB / 1024;
  } else if (KB >= 1) {
    unit = "KB";
    value = MB / 1024;
  } else {
    unit = "Bytes";
    value = sizeInBytes;
  }

  return `${value.toFixed(7)} ${unit}`;
}

type UtilizationTableType = {
  [index: string]: {
    theoreticalMaxVolume: string;
    effectiveVolume: string;
  };
};

const UTILIZATION_TABLE = (key: string) => {
  const table: UtilizationTableType = {
    "20": {
      theoreticalMaxVolume: `4.29 GB`,
      effectiveVolume: `0.0`,
    },
    "21": {
      theoreticalMaxVolume: `8.59 GB`,
      effectiveVolume: `0.0`,
    },
    "22": {
      theoreticalMaxVolume: `17.18 GB`,
      effectiveVolume: `4.93 GB`,
    },
    "23": {
      theoreticalMaxVolume: `34.36 GB`,
      effectiveVolume: `17.03 GB`,
    },
    "24": {
      theoreticalMaxVolume: `68.72 GB`,
      effectiveVolume: `44.21 GB`,
    },
    "25": {
      theoreticalMaxVolume: `137.44 GB`,
      effectiveVolume: `102.78 GB`,
    },
    "26": {
      theoreticalMaxVolume: `274.88 GB`,
      effectiveVolume: `225.86 GB`,
    },
    "27": {
      theoreticalMaxVolume: `549.76 GB`,
      effectiveVolume: `480.43 GB`,
    },
    "28": {
      theoreticalMaxVolume: `1.1 TB`,
      effectiveVolume: `1.0 TB`,
    },
    "29": {
      theoreticalMaxVolume: `2.2 TB`,
      effectiveVolume: `2.6 TB`,
    },
    "30": {
      theoreticalMaxVolume: `4.40 TB`,
      effectiveVolume: `4.2 TB`,
    },
    "31": {
      theoreticalMaxVolume: `8.80 TB`,
      effectiveVolume: `4.2 TB`,
    },
    "32": {
      theoreticalMaxVolume: `17.59 TB`,
      effectiveVolume: `17.20 TB`,
    },
    "33": {
      theoreticalMaxVolume: `35.18 TB`,
      effectiveVolume: `34.63 TB`,
    },
    "34": {
      theoreticalMaxVolume: `70.37 TB`,
      effectiveVolume: `69.58 TB`,
    },
    "35": {
      theoreticalMaxVolume: `140.74 TB`,
      effectiveVolume: `139.63 TB`,
    },
    "36": {
      theoreticalMaxVolume: `281.47 TB`,
      effectiveVolume: `279.91 TB`,
    },
    "37": {
      theoreticalMaxVolume: `562.95 TB`,
      effectiveVolume: `560.73 TB`,
    },
    "38": {
      theoreticalMaxVolume: `1.3 PB`,
      effectiveVolume: `1.12 PB`,
    },
    "39": {
      theoreticalMaxVolume: `2.25 PB`,
      effectiveVolume: `2.25 PB`,
    },
    "40": {
      theoreticalMaxVolume: `4.50 PB`,
      effectiveVolume: `4.50 PB`,
    },
    "41": {
      theoreticalMaxVolume: `9.01 PB`,
      effectiveVolume: `9.00 PB`,
    },
  };

  if (key in table) {
    return table[key];
  }

  return {
    theoreticalMaxVolume: `0 PB`,
    effectiveVolume: `0 PB`,
  };
};

const estimateStorageSize = (depth: number, UNIT_OF_CHUNK = 4) => {
  return {
    effectiveStorageVolume: 2 ** Number(depth),
    theoreticalStorageVolume: 2 ** Number(depth) * UNIT_OF_CHUNK,
  };
};

const getBeeNodeUrl = () => {
  const url = localStorage.getItem(BEE_NODE_URL);
  if (url) {
    return url;
  } else {
    throw Error("No BeeNode url stored in local storage");
  }
};

const setBeeNodeUrl = (url: string) => {
  localStorage.setItem(BEE_NODE_URL, url);
};

const updateBeeNodeUrl = (url: string) => {
  localStorage.setItem(BEE_NODE_URL, url);
};

const clearNodeUrl = (beeNodeUrl: string) => {
  localStorage.removeItem(beeNodeUrl);
};

const utils = {
  updateBeeNodeUrl,
  getBeeNodeUrl,
  setBeeNodeUrl,
  isValidURL,
  clearNodeUrl,
  removeSlashFromUrl,
  UTILIZATION_TABLE,
  convertBytes,
  format,
  estimateStorageSize,
};

export default utils;
