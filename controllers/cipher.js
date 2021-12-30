const { encode, decode } = require("../middlewares/encode-decode");
const schemeCollection = require("../codeSchemes/schemeSelection");

const validSchemes = Object.keys(schemeCollection);

const encoder = async (req, res) => {
  const { str, scheme } = req.query;
  if (!scheme || !str) {
    res.status(400).json({
      error: true,
      msg: "please provide a string and a coding scheme",
    });
  } else {
    if (!validSchemes.includes(scheme)) {
      res
        .status(400)
        .json({ error: true, msg: "please provide a valid scheme" });
    } else {
      const codingScheme = schemeCollection[scheme].encode;
      const identifier = scheme.split("_").reverse()[0];
      try {
        const encoded = (await encode(str, codingScheme)) + "@" + identifier;
        res.status(200).json({ error: false, text: str, encoded, scheme });
      } catch (err) {
        res.status(500).json({ error: true, msg: err.message });
      }
    }
  }
};

const decoder = async (req, res) => {
  const { code } = req.query;
  if (!code) {
    res.status(400).json({ error: true, msg: "please provide a code" });
  } else {
    const schemeName = `scheme_${code.split("@").reverse()[0]}`;
    const codingScheme = schemeCollection[schemeName].decode;
    const actualCode = code.split("@").reverse()[1];
    try {
      const decoded = await decode(actualCode, codingScheme);
      res
        .status(200)
        .json({ error: false, code, decoded, schemeUsed: schemeName });
    } catch (err) {
      res.status(500).json({ error: true, msg: err.message });
    }
  }
};

const schemes = async (req, res) => {
    const info = 'Schemes are used to (encode <-> decode) (text <-> ciphers). The encoded ciphers are separated by "-" and the identifier is used to decode the code. The identifier can be usually seen after the @ symbol as the end of the cipher.';
    res.status(200).json({ error: false, info ,schemes: validSchemes });
};

module.exports = { encoder, decoder, schemes };
