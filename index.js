import Web3, { Contract } from "web3";
import solc from "solc";
import fs from 'fs';

async function web3solc(){
    const web3 = new Web3("http://127.0.0.1:8545");
    let nodeInfo = await web3.eth.getNodeInfo();
    console.log(nodeInfo);
    
    let accounts = await web3.eth.getAccounts();
    console.log(accounts);

    let bal = await web3.eth.getBalance(accounts[0]);
    console.log(bal);

    let balEth = web3.utils.fromWei(bal,"ether");
    console.log(balEth);

    const contract_File = './Cert.sol'
    const content = fs.readFileSync(contract_File).toString();
    // console.log(cont);

    //Compiler options
    const input = {
        language:'Solidity',
        sources:{
            [contract_File]:{
                content:content
            }
        },
        settings:{
            outputSelection:{
               '*':{
                '*': ['*']
               } 
            }
        }
    }

    //Compile the code
    let compileOutput = solc.compile(JSON.stringify(input));
    let output = JSON.parse(compileOutput);
    console.log(output);

    // {
    //     contracts: { './Cert.sol': { Cert: [Object] } },
    //     sources: { './Cert.sol': { id: 0 } }
    //   }
    //Get ABI
    const abi  = output.contracts['./Cert.sol'].Cert.abi;

    //create contract Obj using abi
    const ContractObj = new web3.eth.Contract(abi);

    //get the ByteCode
    const byteCode = output.contracts['./Cert.sol'].Cert.evm.bytecode.object;

    const estimateGas = await ContractObj.deploy({data:'0x' + byteCode}).estimateGas();
    console.log(estimateGas);
    
    //Actual deployment
    const deployedOut = await ContractObj.deploy({data:'0x' + byteCode}).send({from:accounts[0],gasLimit:800000});
    console.log(deployedOut);


    //To intereact with deployed contract, we need to have an object
    const addr = deployedOut._address
    const dContractObject = new web3.eth.Contract(abi,addr);
    // console.log(dContractObject);

    //Interact with Contract Object
    //obj.methods.functionName(arguments);
    //Refer: Cert.sol
    // function issue(
    //     uint256 _id,
    //     string memory _name,
    //     string memory _course,
    //     string memory _grade,
    //     string memory _date
    // ) public onlyAdmin {
    //     Certificates[_id] = Certificate(_name, _course, _grade, _date);
    //     emit Issued(_course, _id, _grade);
    // }
    const trans1 = await dContractObject.methods.issue("123","sajmal","ABC","A","30/06/2023").send({from:accounts[0],gasLimit:320000});
    console.log(trans1);

    //Read Certificate by Id
    const CertDetails = await dContractObject.methods.Certificates("123").call();
    console.log(CertDetails);
}

web3solc();