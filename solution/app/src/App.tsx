import { NetworkType } from "@airgap/beacon-types";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { TezosToolkit } from "@taquito/taquito";
import { useEffect, useState } from "react";
import ConnectButton from "./ConnectWallet";
import DisconnectButton from "./DisconnectWallet";
import { PokeGameWalletType } from "./pokeGame.types";
import { ContractsService, Contract } from "@dipdup/tzkt-api";
import "./App.css";

function App() {
  const [Tezos, setTezos] = useState<TezosToolkit>(
    new TezosToolkit("https://ghostnet.tezos.marigold.dev")
  );
  const [wallet, setWallet] = useState<BeaconWallet>(
    new BeaconWallet({
      name: "Training",
      preferredNetwork: NetworkType.GHOSTNET,
    })
  );

  const contractsService = new ContractsService({
    baseUrl: "https://api.ghostnet.tzkt.io",
    version: "",
    withCredentials: false,
  });
  const [contracts, setContracts] = useState<Array<Contract>>([]);

  const fetchContracts = () => {
    (async () => {
      setContracts(
        await contractsService.getSimilar({
          address:  import.meta.env.VITE_CONTRACT_ADDRESS,
          includeStorage: true,
          sort: { desc: "id" },
        })
      );
    })();
  };

  const poke = async (contract: Contract) => {
    let c: PokeGameWalletType = await Tezos.wallet.at<PokeGameWalletType>(
      "" + contract.address
    );
    try {
      const op = await c.methods.default().send();
      await op.confirmation();
      alert("Tx done");
    } catch (error: any) {
      console.table(`Error: ${JSON.stringify(error, null, 2)}`);
    }
  };

  useEffect(() => {
    Tezos.setWalletProvider(wallet);
    (async () => {
      const activeAccount = await wallet.client.getActiveAccount();
      if (activeAccount) {
        setUserAddress(activeAccount.address);
        const balance = await Tezos.tz.getBalance(activeAccount.address);
        setUserBalance(balance.toNumber());
      }
    })();
  }, [wallet]);

  const [userAddress, setUserAddress] = useState<string>("");
  const [userBalance, setUserBalance] = useState<number>(0);

  return (
    <div className="App">
      <header className="App-header">
        <ConnectButton
          Tezos={Tezos}
          setUserAddress={setUserAddress}
          setUserBalance={setUserBalance}
          wallet={wallet}
        />

        <DisconnectButton
          wallet={wallet}
          setUserAddress={setUserAddress}
          setUserBalance={setUserBalance}
        />

        <div>
          I am {userAddress} with {(userBalance / 1000000).toLocaleString("en-US")} ꜩ
        </div>
        <br />
        <div>
          <button onClick={fetchContracts}>Fetch contracts</button>
          <table>
            <thead>
              <tr>
                <th>address</th>
                <th>people</th>
                <th>action</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.address}>
                  <td style={{ borderStyle: "dotted" }}>{contract.address}</td>
                  <td style={{ borderStyle: "dotted" }}>
                    {contract.storage.join(", ")}
                  </td>
                  <td style={{ borderStyle: "dotted" }}>
                    <button onClick={() => poke(contract)}>Poke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </header>
    </div>
  );
}

export default App;
