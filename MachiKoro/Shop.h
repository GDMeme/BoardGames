#pragma once

#include <iostream>
#include <string>
#include <vector>

#include "GameBoard.h"

class Shop {
    public:
        std::vector<std::string> redNames;
        std::vector<int> redPrice;
        std::vector<int> amountOfRed;

        std::vector<std::string> blueNames;
        std::vector<int> bluePrice;
        std::vector<int> amountOfBlue;

        std::vector<std::string> greenNames;
        std::vector<int> greenPrice;
        std::vector<int> amountOfGreen;

        std::vector<std::string> purpleNames;
        std::vector<int> purplePrice; 
        std::vector<int> amountOfPurple;
        
        Shop() {
            this->redNames = {"Cafe", "Family Restaurant"};
            this->redPrice = {2, 3};
            this->amountOfRed = {6, 6};

            this->blueNames = {"Wheat Field", "Ranch", "Forest", "Mine", "Apple Orchard"};
            this->bluePrice = {1, 1, 3, 6, 3};
            this->amountOfBlue = {6, 6, 6, 6, 6};

            this->greenNames = {"Bakery", "Convenience Store", "Cheese Factory", "Furniture Factory", "Fruit and Vegetable Market"};
            this->greenPrice = {1, 2, 5, 3, 2};
            this->amountOfGreen = {6, 6, 6, 6, 6};

            this->purpleNames = {"Stadium", "TV Station", "Business Center"};
            this->purplePrice = {6, 7, 8};
            this->amountOfPurple = {4, 4, 4};
        }

        ~Shop() {}

        void purchaseItemPrompt() {
            std::cout << "Would you like to purchase something? Type Y or N." << endl;
            return;
        }

        void purchaseOptionsPrompt() {
            std::cout << "What would you like to purchase? Type:" << std::endl << "N for nothing." << std::endl << "R for red estblishment." 
                << std::endl << "B for blue establishment." << std::endl << "G for green establishment." << std::endl << "P for purple establishment." 
                    << std::endl << "L for landmark." << std::endl;
        }

        bool isWithinBounds(std::string purchaseItem, int endIndex) {
            for (char i: purchaseItem) {
                if (std::isdigit(i) == 0) {
                    return false;
                } 
            }
            return std::stoi(purchaseItem) >= 1 && std::stoi(purchaseItem) <= endIndex;
        }

        void purchaseEstablishmentPrompt(std::string colour, std::vector<std::string> names) {
            int purchaseItemCounter = 0;
            std::cout << "Which " << colour << " establishment would you like to buy? Type:" << std::endl;
            for (std::string i: names) {
                std::cout << purchaseItemCounter << " for " << i << std::endl;
                purchaseItemCounter++;
            }
            std::cout << "Type B to go back" << std::endl;
            return;
        }

        bool purchaseEstablishment(GameBoard* gameBoard, std::string colour, int playerCounter, 
                std::vector<std::string> names, std::vector<int> price, std::vector<int> amount, int endIndex) { // returns true if something was bought
            std::string purchaseItem;
            purchaseEstablishmentPrompt(colour, names);
            int *playerBalance = &(gameBoard->players[playerCounter]->balance); // this probably works
            while (std::cin >> purchaseItem) {
                if (isWithinBounds(purchaseItem, endIndex)) {
                    int purchaseItemIndex = std::stoi(purchaseItem);
                    if ((*playerBalance >= price[purchaseItemIndex]) && (amount[purchaseItemIndex] > 0)) {
                        std::cout << "You bought a " << names[purchaseItemIndex];
                        *playerBalance -= price[purchaseItemIndex];
                        std::cout << "New balance: " << *playerBalance;
                        amount[purchaseItemIndex]--;
                        return true;
                    } else {
                        std::cout << "You don't have enough money to buy this establishment. Try doing something else." << std::endl;
                        purchaseEstablishmentPrompt(colour, names);
                    }
                } else if (purchaseItem == "B") {
                    return false;
                } else {
                    std::cout << "Invalid option, try again." << std::endl;

                    purchaseEstablishmentPrompt(colour, names);
                }
            }
        }

        bool purchaseLandmark() {
            
        }
        
    private:

};