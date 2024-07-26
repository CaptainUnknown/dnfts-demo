import type { VercelRequest, VercelResponse } from '@vercel/node';
import pinataSDK from '@pinata/sdk';
import * as dotenv from 'dotenv';

dotenv.config();
const pinata = new pinataSDK("9292e8fab7079c002cab", "e685c1dcafe35c1379c61441b511252529d97a5c05701dd597a587d4f3cf5dfb");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { color = 'blue' } = req.query;
  // This can be replaced with user uploaded blob, even directly with next.js
  const imageUrl = `https://zxmftdsqe2w9uhvz.public.blob.vercel-storage.com/${color}.png`;
  const metadata = {
    "name": `${color} Dynamic NFT`,
    "description": `A ${color} colored sample dynamic NFT for a dynamic NFT implementation for Nex Labs.`,
    "image": imageUrl,
    "attributes": [{ "trait_type": "Color", "value": `${color}` }, { "trait_type": "license", "value": "MIT" }]
  };

  try {
    const response = await fetch(imageUrl);
    if (response.ok && response.headers.get('content-type').startsWith('image/')) {
      // dynamically upload to pinata on demand
      const pinataRes = await pinata.pinJSONToIPFS(metadata);

      // Directly Update the metadata with a Smart Contract Call
      // OR this endpoint gets triggered by chainlink functionv

      return res.status(200).json({ message: `NFT Dynamically updated to ${color}`, hash: pinataRes.IpfsHash });
    } else return res.status(404).json({ message: 'Image not found' });
  } catch (error) {
    console.error('Error retrieving image:', error);
    return res.status(500).json({message: 'Internal server error'});
  }
}