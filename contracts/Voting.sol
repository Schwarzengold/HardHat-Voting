// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting 
{
    address private owner;
    uint private candidateFee = 0.01 ether;

    struct Candidate 
    {
        string name;
        uint votes;
        bool exists;
    }

    mapping(string => Candidate) private candidates;
    string[] private candidateList;
    mapping(address => bool) private voters;
    address[] private votersList;

    constructor() 
    {
        owner = msg.sender;
    }

    function addCandidate(string memory _name) public payable 
    {
        require(msg.value >= candidateFee, "Insufficient fee");
        require(!candidates[_name].exists, "Candidate already exists");
        candidates[_name] = Candidate(_name, 0, true);
        candidateList.push(_name);
    }

    function vote(string memory _name) public 
    {
        require(!voters[msg.sender], "Already voted");
        require(candidates[_name].exists, "Candidate does not exist");
        candidates[_name].votes++;
        voters[msg.sender] = true;
        votersList.push(msg.sender);
    }

    function getCandidateDetails(string memory _name) public view returns (string memory, uint) 
    {
        require(candidates[_name].exists, "Candidate does not exist");
        Candidate memory cand = candidates[_name];
        return (cand.name, cand.votes);
    }

    function getCandidateList() public view returns (string[] memory) 
    {
        return candidateList;
    }

    function resetElection() public 
    {
        require(msg.sender == owner, "Only owner can reset");

        for (uint i = 0; i < candidateList.length; i++) 
        {
            string memory candName = candidateList[i];
            delete candidates[candName];
        }
        delete candidateList;

        for (uint i = 0; i < votersList.length; i++) 
        {
            voters[votersList[i]] = false;
        }
        delete votersList;
    }

    function getWinner() public view returns (string memory) 
    {
    uint highestVotes = 0;
    string memory winner;
    for (uint i = 0; i < candidateList.length; i++) 
    {
        string memory candidateName = candidateList[i];
        if (candidates[candidateName].votes > highestVotes) 
        {
            highestVotes = candidates[candidateName].votes;
            winner = candidateName;
        }
    }
    return winner;
    }
}
