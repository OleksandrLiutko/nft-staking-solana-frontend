import { useEffect, useState } from "react"
import { useDispatch, useSelector } from 'react-redux';
import { TbDotsCircleHorizontal } from "react-icons/tb"
import axios from "axios";

import Toast from "./Toast";
import { setDetailData } from "../store/detailslice";
import {
    initProject,
    stakeNft,
    getStakedInfo,
    getClaimableReward,
    unstakeNft,
    claimReward
} from "../context/helper/nft-staking";
import { getNftMetadataURI, getAllNftData } from "../context/utils";

import HEADER from "../assets/new-logo.png"
import NFT from "../assets/nft.jpg"
import Loading from "./Loading";
import { INITIALIZER, NETWORK, NFT_CREATOR } from "../config/constants";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

const collection_creator = NFT_CREATOR;
const initializer = INITIALIZER;

const STAKETAB = 1;
const UNSTAKETAB = 2;

const SUCCESS = 1;
const WARNNING = 2;

const Staking = ({ shows, setShows }) => {
    const dispatch = useDispatch();

    const [tabStatus, setTabStatus] = useState(UNSTAKETAB);
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState(2) //1: success, 2: error
    const [fetchFlag, setFetchFlag] = useState(true);
    const [redraw, setRedraw] = useState(false)

    // const [unstakedInfo, setUnStakedInfo] = useState()
    const [items, setItems] = useState([]);
    // const [stakedInfo, setStakedInfo] = useState()
    const [vault_items, setVault_items] = useState([]);
    const [claimableReward, setClaimableReward] = useState(0);

    const [selectedUnStakedTokenIds, setSelectedUnStakedTokenIds] = useState([]);
    const [selectedStakedTokenIds, setSelectedStakedTokenIds] = useState([]);
    const [tokenAllSelected, setTokenAllSelected] = useState(false);
    const [stakedTokenAllSelected, setStakedTokenAllSelected] = useState(false);

    const [stake, setStake] = useState(false)
    const [unstake, setUnstake] = useState(false)

    const isConnected = useSelector((state) => state.wallet.isConnected);
    const pubKey = useSelector((state) => state.wallet.publicKey);
    const nftData = useSelector((state) => (state.detail.data));

    const [loading, setLoading] = useState(false);

    const wallet = useWallet();
    const { connection } = useConnection();

    // console.log("selectedUnStakedTokenIds : ", selectedUnStakedTokenIds);
    // console.log("selectedStakedTokenIds : ", selectedStakedTokenIds);

    useEffect(() => {
        async function fetchAll() {
            // console.log("Fetching...............")
            if (fetchFlag && wallet.publicKey) {
                console.log('[log] => fetching...');
                await fetchUnstakedInfo()
                await fetchStakedInfo()
                setFetchFlag(false)
            }
        }

        fetchAll();
    }, [fetchFlag, wallet])

    useEffect(() => {
        async function getReward() {
            await getClaimableRewards();
        }

        getReward();
    }, [vault_items])

    useEffect(() => {
        async function loadNFTs() {
            console.log('[log] => nftData: ', nftData);
            let arr = [];
            nftData.map(async (item) => {
                // // console.log('name : ', item);
                let uri = await axios.get(item.data.uri);
                arr.push({ id: item.mint, uri, name: item.data.name });
            });
            // console.log('arr', arr);
            setItems(arr);
        }

        loadNFTs();
    }, [nftData])

    const fetchUnstakedInfo = async () => {
        let data = await getNftTokenData();
        try {
            if (data && data.length > 0) {
                console.log('[log] => fetchNFTInfo() before filter', data);
                let collection = data.filter((item) => item.data.creators && (item.data.creators.filter((creator) => creator.verified == 1))[0].address == collection_creator);
                console.log('[log] => fetchNFTInfo() after filter', collection);
                dispatch(setDetailData(collection));
            }
        } catch (error) {
            console.log('[error] => fetchNFTInfo() ', error);
        }
        // getNftTokenData().then((data) => {
        //     if (data) {
        //         // console.log('allData', data);
        //         let collection = data.filter((item) => item.data.creators && (item.data.creators.filter((creator) => creator.verified == 1))[0].address == collection_creator);
        //         // console.log('collection', collection);
        //         dispatch(setDetailData(collection))
        //     }
        // })
    }

    const getNftTokenData = async () => {
        try {
            console.log('[log] => getNfttokenData() wallet', wallet.publicKey.toBase58());
            let nftData = await getAllNftData(wallet, connection);
            var data = Object.keys(nftData).map((key) => nftData[key]); let arr = [];
            let n = data.length;
            for (let i = 0; i < n; i++) {
                // // console.log(data[i].data.uri);
                arr.push(data[i]);
            }
            // console.log(`arr`)
            return arr;
        } catch (error) {
            console.log('[error] => getNftTokenData() ', error);
        }
    };

    const fetchStakedInfo = async () => {
        let stakedInfo = await getStakedInfo(wallet, connection);
        let arr = [];
        for (let i = 0; i < stakedInfo.length; i++) {
            let uri = await getNftMetadataURI(wallet, connection, stakedInfo[i].account.nftAddr);
            arr.push({
                id: stakedInfo[i].account.nftAddr.toBase58(),
                uri,
                name: uri.name,
                classId: stakedInfo[i].account.classId,
                lastUpdateTime: stakedInfo[i].account.lastUpdateTime
            });
            // console.log("STAKED NAME ^^^^^^^^^^^^^ ", uri.data.name);
        }
        setVault_items(arr);
    }

    const getClaimableRewards = async () => {
        // console.log("Vault Items ************************> ", vault_items);
        let arr = [];
        vault_items.map((item) => {
            arr.push({ lastUpdateTime: Number(item.lastUpdateTime), classId: item.classId });
        });
        let rewards = getClaimableReward(arr);
        setClaimableReward(rewards);
    }

    const IsSelected = (type, tokenId) => {
        const list = type == UNSTAKETAB ? selectedUnStakedTokenIds : selectedStakedTokenIds
        for (let i = 0; i < list.length; i++) {
            if (list[i] == tokenId) {
                return true;
            }
        }
        return false;
    }

    const removeItemFromArray = (oldlist, tokenId) => {
        let list = oldlist;
        for (let i = 0; i < list.length; i++) {
            if (list[i] == tokenId) {
                list[i] = list[list.length - 1];
                list.pop()
                break;
            }
        }
        return list;
    }

    const unstakedNFTClick = async (tokenId) => {
        // console.log("Unstaked nft click..........", tokenId);
        if (IsSelected(UNSTAKETAB, tokenId)) {
            // console.log("Deselecting on unstaked.............", selectedUnStakedTokenIds.length);
            let newlist = removeItemFromArray(
                selectedUnStakedTokenIds,
                tokenId,
            );
            setSelectedUnStakedTokenIds(newlist)
            // console.log("Deselecting on unstaked.............", selectedUnStakedTokenIds.length);
        } else {
            // console.log("Selecting on unstaked.............", selectedUnStakedTokenIds.length);
            let newlist = selectedUnStakedTokenIds;
            newlist.push(tokenId);
            setSelectedUnStakedTokenIds(newlist);
            // console.log("Selecting on unstaked.............", selectedUnStakedTokenIds.length);
        }

        if (selectedUnStakedTokenIds.length > 0) setStake(true);
        else setStake(false);

        if (selectedUnStakedTokenIds.length == items.length) setTokenAllSelected(true);
        else if (tokenAllSelected) setTokenAllSelected(false);

        setRedraw(!redraw);
    }

    const stakedNFTClick = async (tokenId) => {
        // console.log("Staked nft click..........", tokenId);
        if (IsSelected(STAKETAB, tokenId)) {
            // console.log("Deselecting on staked.............");
            var newlist = removeItemFromArray(
                selectedStakedTokenIds,
                tokenId,
            )
            setSelectedStakedTokenIds(newlist)
        } else {
            // console.log("Selecting on staked.............");
            var newlist = selectedStakedTokenIds;
            newlist.push(tokenId);
            setSelectedStakedTokenIds(newlist);
        }

        if (selectedStakedTokenIds.length > 0) setUnstake(true);
        else setUnstake(false);

        if (selectedStakedTokenIds.length == vault_items.length) setStakedTokenAllSelected(true);
        else if (stakedTokenAllSelected) setStakedTokenAllSelected(false);

        setRedraw(!redraw);
    }

    const onClickTokenSelectAll = () => {
        // console.log("Clicked Select All................");
        let selectState = !tokenAllSelected;
        setTokenAllSelected(selectState);

        let newlist = selectedUnStakedTokenIds;
        let info = nftData;
        if (selectState) {
            info && info.map((item) => {
                if (!IsSelected(UNSTAKETAB, item.mint)) {
                    newlist.push(item.mint);
                }
            })
            setStake(true);
        } else {
            info && info.map((item) => {
                if (IsSelected(UNSTAKETAB, item.mint)) {
                    newlist = removeItemFromArray(
                        newlist,
                        item.mint,
                    );
                }
            })
            setStake(false);
        }

        setSelectedUnStakedTokenIds(newlist)
    }

    const onClickStakedTokenSelectAll = () => {
        // console.log("Clicked Select All................");
        let selectState = !stakedTokenAllSelected;
        setStakedTokenAllSelected(selectState);

        let newlist = selectedStakedTokenIds;
        let info = vault_items;
        if (selectState) {
            info && info.map((item) => {
                if (!IsSelected(UNSTAKETAB, item.id)) {
                    newlist.push(item.id);
                }
            })
            setUnstake(true);
        } else {
            info && info.map((item) => {
                if (IsSelected(UNSTAKETAB, item.id)) {
                    newlist = removeItemFromArray(
                        newlist,
                        item.id,
                    );
                }
            })
            setUnstake(false);
        }

        setSelectedUnStakedTokenIds(newlist)
    }

    const onClickUnstakeTab = () => {
        setSelectedStakedTokenIds([]);
        setStakedTokenAllSelected(false);
        setUnstake(false);
        setTabStatus(UNSTAKETAB);
    }

    const onClickStakedTab = () => {
        setSelectedUnStakedTokenIds([]);
        setTokenAllSelected(false);
        setStake(false);
        setTabStatus(STAKETAB)
    }

    const handleStake = async () => {
        if (!wallet.publicKey) {
            onToastOpen(WARNNING, "Please connect wallet");
            return;
        }

        if (selectedUnStakedTokenIds.length == 0) {
            onToastOpen(WARNNING, "Please select NFT to stake");
            return;
        }

        try {
            setLoading(true);
            let res = await stakeNft(wallet, connection, selectedUnStakedTokenIds);
            if (res.result == "success") {
                onToastOpen(SUCCESS, "Staked Successfully!");
            } else {
                onToastOpen(WARNNING, "Staked Failed!");
            }

            setLoading(false);
            setSelectedUnStakedTokenIds([]);
            setStake(false);
            setFetchFlag(true);
        } catch (e) {
            setLoading(false);
            // onToastOpen(WARNNING, "");
            console.log("Staking failed.", e);
        }
    }

    const handleUnstake = async () => {
        if (!wallet.publicKey) {
            onToastOpen(WARNNING, "Please connect wallet");
            return;
        }

        if (selectedStakedTokenIds.length == 0) {
            onToastOpen(WARNNING, "Please select NFT to unstake");
            return;
        }

        try {
            setLoading(true);
            let res = await unstakeNft(wallet, connection, selectedStakedTokenIds);
            if (res.result == "success") {
                onToastOpen(SUCCESS, "Unstaking Successfully!");
            } else {
                onToastOpen(WARNNING, "Unstaking Failed!");
            }

            setLoading(false);
            setSelectedStakedTokenIds([]);
            setUnstake(false);
            setFetchFlag(true);
        } catch (e) {
            console.log('Unstake failed', e);
            setLoading(false);
            // onToastOpen(WARNNING, e);
        }
    }

    const onClickClaimReward = async () => {
        if (!wallet.publicKey) {
            onToastOpen(WARNNING, "Please connect wallet");
            return;
        }

        try {
            setLoading(true);
            let res = await claimReward(wallet, connection, vault_items);
            if (res.result == "success") {
                onToastOpen(SUCCESS, "Claim Reward Successfully!");
            } else {
                onToastOpen(WARNNING, "Claim Reward Failed!");
            }

            setLoading(false);
            setFetchFlag(true);
        } catch (e) {
            console.log('Claim failed', e);
            setLoading(false);
            // onToastOpen(WARNNING, e);
        }
    }

    const refreshHandler = () => {
        setFetchFlag(true);
    }

    const onToastOpen = (type, msg) => {
        setShowToast(true);
        setToastMessage(msg);
        setToastType(type);
    }

    const onToastClose = () => {
        setShowToast(false);
    }

    const onInitClick = () => {
        initProject(wallet, connection);
    }

    // console.log("Rendering Component ...................");
    return (
        <div className={shows ? "black-background" : "overlay"}>
            <div className={shows ? `staking active` : `staking`}>
                <div className="staking-container">
                    <div className="staking-logo">
                        <div className="staking-logo-img-wrapper">
                            <div className="staking-logo-img" style={{ backgroundImage: `url(${HEADER})` }}></div>

                        </div>
                        <span>{NETWORK}</span>
                        <button className="back-btn click-cursor" onClick={() => setShows(false)}>Back</button>
                    </div>

                    <div className="staking-header">
                        <h2>Your Royal Society NFT staking account</h2>
                        <p style={{ marginBottom: '15px', marginLeft: "20px" }}> Below you can stake,unstake and collect SWRD tokens.</p>

                        <div className="staking-it">

                            <div className="staking-nft-img-wrapper">
                                <div className="staking-nft-img" style={{ backgroundImage: `url(${NFT})` }}></div>
                                <p>NTFs staked : {vault_items.length}</p>
                            </div>
                            {/* <p>NFT Lock period: 20 days</p> */}
                            <div>
                                <button className={stake ? "click-cursor" : "disabled click-cursor"} onClick={stake ? handleStake : null}>Stake</button>
                                <button className={unstake ? "click-cursor" : "disabled click-cursor"} onClick={unstake ? handleUnstake : null}>Unstake</button>
                                <button className="click-cursor" onClick={onClickClaimReward}>Claim {claimableReward}</button>
                                <button className="click-cursor" onClick={refreshHandler}>Refresh</button>
                                {wallet.publicKey == initializer && (<button onClick={onInitClick} className="click-cursor">Init Project</button>)}
                            </div>

                        </div>

                    </div>

                    <div className="staking-item">
                        <div className="staking-filter">
                            <button className={tabStatus == UNSTAKETAB ? `selected click-cursor` : 'click-cursor'} onClick={tabStatus == UNSTAKETAB ? null : onClickUnstakeTab}>Your Wallet</button>
                            <button className={tabStatus == STAKETAB ? `selected click-cursor` : 'click-cursor'} onClick={tabStatus == STAKETAB ? null : onClickStakedTab}>Staked NFT</button>
                            {tabStatus == UNSTAKETAB ?
                                (<button className="select-all click-cursor" onClick={onClickTokenSelectAll}>{tokenAllSelected ? "Deselect All" : "Select All"}</button>) :
                                (<button className="select-all click-cursor" onClick={onClickStakedTokenSelectAll}>{stakedTokenAllSelected ? "Deselect All" : "Select All"}</button>)}
                        </div>

                        <div className="staking-item-container">
                            {tabStatus == UNSTAKETAB ? items && items.length != 0 && items.map((item, idx) => (
                                <div key={idx} className="staking-item-img-wrapper" onClick={() => unstakedNFTClick(item.id)}>
                                    <div className={selectedUnStakedTokenIds.includes(item.id) ? "staking-item-img clicked-nft" : "staking-item-img"} style={{ backgroundImage: `url(${item.uri.data.image})` }}>
                                        <i className={selectedUnStakedTokenIds.includes(item.id) ? "selected-icon clicked" : "selected-icon"}>
                                            <TbDotsCircleHorizontal />
                                        </i>
                                    </div>
                                    <p>{item.name}</p>
                                </div>
                            )) : vault_items && vault_items.length != 0 && vault_items.map((item, idx) => (
                                <div key={idx} className="staking-item-img-wrapper" onClick={() => stakedNFTClick(item.id)}>
                                    <div className={selectedStakedTokenIds.includes(item.id) ? "staking-item-img clicked-nft" : "staking-item-img"} style={{ backgroundImage: `url(${item.uri.image})` }}>
                                        <i className={selectedStakedTokenIds.includes(item.id) ? "selected-icon clicked" : "selected-icon"}>
                                            <TbDotsCircleHorizontal />
                                        </i>
                                    </div>
                                    <p>{item.name}</p>
                                </div>))
                            }

                        </div>
                        {/* <div className="staking-ft">
                            <p>Select NFTs to move them to your {filter === "Your Wallet" ? "vault" : "wallet, stake or unstake"}</p>
                            <button className={deposit ? `btn-ft active` : `btn-ft`} onClick={depositHandler}> Deposit selected</button>
                            <button style={{ marginTop: "-50px" }} className={Withdraw ? `btn-ft active` : `btn-ft`} onClick={withdrawHandler}>Withdraw selected</button>
                        </div> */}
                    </div>
                </div>
            </div>
            <Loading
                open={loading}
            />
            <Toast
                open={showToast}
                message={toastMessage}
                handleClose={onToastClose}
                type={toastType}
            />
        </div>
    )
}
export default Staking;