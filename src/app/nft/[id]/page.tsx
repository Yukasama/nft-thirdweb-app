"use client";

import {
  useAddress,
  useDisconnect,
  useMetamask,
  useContract,
} from "@thirdweb-dev/react";
import { sanityClient, urlFor } from "../../../../sanity";
import useSWR from "swr";
import Loader from "@/components/Loader";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BigNumber } from "ethers";
import toast from "react-hot-toast";

type Props = {
  params: {
    id: string;
  };
};

export default function NFTDropPage({ params: { id } }: Props) {
  const [claimedSupply, setClaimedSupply] = useState<number>(0);
  const [totalSupply, setTotalSupply] = useState<BigNumber>();
  const [allSupplyClaimed, setAllSupplyClaimed] = useState<boolean>(false);
  const [price, setPrice] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const connectWithMetamask = useMetamask();
  const address = useAddress();
  const disconnect = useDisconnect();

  const query = `*[_type == "collection" && slug.current == $id][0] {
    _id,
    title,
    address,
    description,
    nftCollectionName,
    mainImage {
      asset
    },
    previewImage {
      asset
    },
    slug {
      current
    },
    creator-> {
      _id,
      name,
      address,
      slug {
        current,
      },
    },
  }`;

  const { data, error } = useSWR(
    () => query,
    () => sanityClient.fetch(query, { id })
  );

  const collection: Collection = data;

  const { contract } = useContract(collection?.address, "nft-drop");

  useEffect(() => {
    if (!contract) return;

    const fetchPrice = async () => {
      const claimConditions = await contract.claimConditions.getAll();
      setPrice(claimConditions?.[0].currencyMetadata.displayValue);
    };

    fetchPrice();
  }, [contract]);

  useEffect(() => {
    if (!contract || !collection) return;

    const contractData = async () => {
      setLoading(true);
      const claimed = await contract.getAllClaimed();
      const total = await contract.totalSupply();

      setClaimedSupply(claimed.length);
      setTotalSupply(total);
      if (claimedSupply === totalSupply?.toNumber()) setAllSupplyClaimed(true);

      setLoading(false);
    };

    contractData();
  }, [contract]);

  const mintNFT = () => {
    if (!contract || !address) return;

    const quantity = 1;

    setLoading(true);
    const minting = toast.loading("Minting your NFT...");

    contract
      .claimTo(address, quantity)
      .then(async (td) => {
        const receipt = td[0].receipt;
        const claimedTokenId = td[0].id;
        const claimedNFT = await td[0].data();

        toast.success("Successfully minted your NFT!", { id: minting });
      })
      .catch((err) => {
        toast.error("Whoops! Something went wrong!", { id: minting });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (error) {
    return <div>Not found</div>;
  }

  return (
    <div className="h-screen">
      {!collection ? (
        <Loader />
      ) : (
        <div className="flex flex-col h-screen lg:grid lg:grid-cols-10">
          <div className="bg-gradient-to-br from-cyan-800 to-rose-500 lg:col-span-4">
            <div className="flex flex-col items-center justify-center py-2 lg:min-h-screen">
              <div className="bg-gradient-to-br from-yellow-400 p-1.5 to-purple-600 rounded-xl">
                <img
                  className="rounded-xl w-44 object-cover lg:h-96 lg:w-72"
                  src={urlFor(collection.previewImage).url()}
                  alt="Front NFT"
                />
              </div>
              <div className="text-center p-5 space-y-2">
                <h1 className="text-4xl font-bold text-white">
                  {collection.nftCollectionName}
                </h1>
                <h2 className="text-xl text-gray-300">
                  {collection.description}
                </h2>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col p-12 lg:col-span-6">
            <header className="flex items-center justify-between">
              <Link
                href="/"
                className="w-52 cursor-pointer text-xl font-extralight sm:w-80">
                The{" "}
                <span className="font-bold underline decoration-pink-600/70">
                  {collection.nftCollectionName}
                </span>{" "}
                NFT Marketplace
              </Link>
              <button
                onClick={() => (address ? disconnect() : connectWithMetamask())}
                className="rounded-full bg-rose-400 hover:bg-rose-500 text-white p-4 py-2.5 text-xs font-bold lg:px-5 lg:py-3 lg:text-base">
                {address ? "Sign Out" : "Sign In"}
              </button>
            </header>

            <hr className="my-2 border" />
            {address && (
              <p className="text-center text font-medium text-rose-400">
                You`re logged in with wallet {address.substring(0, 5)}...
                {address.substring(address.length - 5)}
              </p>
            )}

            <div className="mt-10 flex flex-1 flex-col items-center text-center lg:justify-center">
              <img
                className="w-80 object-cover pb-10 lg:h-60"
                src={urlFor(collection.mainImage).url()}
                alt="NFT Collection"
              />
              <h1 className="text-3xl font-bold lg:text-5xl lg:font-extrabold">
                {collection.title}
              </h1>
              <div className="pt-5 h-10">
                {loading ? (
                  <img
                    className="w-[150px] object-contain"
                    src="https://cdn.hackernoon.com/images/0*4Gzjgh9Y7Gu8KEtZ.gif"
                    alt="Loading..."
                  />
                ) : (
                  <p className="text-xl text-rose-400">
                    {claimedSupply} / {totalSupply?.toString()} NFTs claimed
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={mintNFT}
              disabled={loading || allSupplyClaimed || !address}
              className="h-16 w-full text-white rounded-full bg-rose-500 font-bold hover:scale-[1.01] duration-300 disabled:bg-rose-300">
              {loading
                ? "Loading..."
                : allSupplyClaimed
                ? "Sold Out"
                : !address
                ? "Connect Wallet To Mint"
                : `Mint NFT (${price} ETH)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
