
const hexToRgb = hex => {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

const relativeLuminanceW3C = (R8bit, G8bit, B8bit) => {

    const RsRGB = R8bit/255
    const GsRGB = G8bit/255
    const BsRGB = B8bit/255

    const R = (RsRGB <= 0.03928) ? RsRGB/12.92 : Math.pow((RsRGB+0.055)/1.055, 2.4)
    const G = (GsRGB <= 0.03928) ? GsRGB/12.92 : Math.pow((GsRGB+0.055)/1.055, 2.4)
    const B = (BsRGB <= 0.03928) ? BsRGB/12.92 : Math.pow((BsRGB+0.055)/1.055, 2.4)

    // For the sRGB colorspace, the relative luminance of a color is defined as:
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

const formatArray = original => {
  const initial = original[0]
  const last = original[original.length - 1]
  let final = original.map(child => child)
  // add the 1st slide last and the last slide first
  final.push(initial)
  final.unshift(last)

  return final
}

const assertLuminance = (colour) => {
  if (colour) {
    const color = hexToRgb(colour)

    return relativeLuminanceW3C (color.r, color.g, color.b) > 0.5 ?  'light' : 'dark'
  }

  return 'light'
}

const format = {
  array: formatArray
}

const luminance = {
  check: assertLuminance
}

export { format, luminance }
