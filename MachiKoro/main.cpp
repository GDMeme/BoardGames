#include <iostream>
#include <stdlib.h>
#include <time.h>

#include "GameBoard.h"
#include "Shop.h"

using namespace std;

// TODO: Landmark interactions, income/payment, determine winner, etc. 

int main() {
    cout << "Welcome to Machi Koro" << endl;
    cout << "How many people will be playing? Must be an integer between 1 and 4 inclusive." << endl;
    int numOfPlayers;
    while (cin >> numOfPlayers) {
        if (numOfPlayers < 1 || numOfPlayers > 4) {
            cout << "Invalid number of players" << endl;
        } else {
            break;
        }
    }
    GameBoard* gameBoard = new GameBoard(numOfPlayers);
    Shop* shop = new Shop();
    bool winner = false;
    int playerCounter = 0;
    string rollVerify;
    srand(time(NULL));
    int roll;
    string purchaseItem;
    cout << "At any time, type BAL to show your balance" << endl; // TODO: MAKE SURE THIS WORKS
    while (!winner) {
        cout << "Player " << playerCounter + 1 << "'s turn!" << endl;
        cout << "Press R to roll the dice" << endl;
        while(cin >> rollVerify) {
            if (rollVerify == "R") {
                break;
            } else {
                cout << "You failed to roll the dice... try again!" << endl;
            }
        };
        cout << "You rolled a " << rand() % 6 + 1 << "." << endl;

        // income/pay

        // purchase
        shop->purchaseItemPrompt();
        while (cin >> purchaseItem) {
            if (purchaseItem == "Y") {
                shop->purchaseOptionsPrompt();
                while(cin >> purchaseItem) {
                    if (purchaseItem == "N") { // nothing
                        break;
                    } else if (purchaseItem == "R") { // RBGPL
                        if (shop->purchaseEstablishment(gameBoard, "red", playerCounter, shop->redNames, shop->redPrice, shop->amountOfRed, 2)) { // 2 red establishments
                            break;
                        }
                        // if got here, did not purchase an establishment
                        shop->purchaseOptionsPrompt();
                    } else if (purchaseItem == "B") {
                        if (shop->purchaseEstablishment(gameBoard, "blue", playerCounter, shop->blueNames, shop->bluePrice, shop->amountOfBlue, 5)) { // 5 blue establishments
                            break;
                        }
                        // if got here, did not purchase an establishment
                        shop->purchaseOptionsPrompt();
                    } else if (purchaseItem == "G") {
                        if (shop->purchaseEstablishment(gameBoard, "green", playerCounter, shop->blueNames, shop->greenPrice, shop->amountOfGreen, 5)) { // 5 green establishments
                            break;
                        }
                        // if got here, did not purchase an establishment
                        shop->purchaseOptionsPrompt();
                    } else if (purchaseItem == "P") {
                        if (shop->purchaseEstablishment(gameBoard, "purple", playerCounter, shop->blueNames, shop->greenPrice, shop->amountOfPurple, 3)) { // 3 purple establishments
                            break;
                        }
                        // if got here, did not purchase an establishment
                        shop->purchaseOptionsPrompt();
                    } else if (purchaseItem == "L") {
                        shop->purchaseLandmark(); // this function call is not finished
                        // if upgraded landmark, check if winner
                        // can probably send address of winner boolean so it's editable
                    } else {
                        cout << "Invalid option, try again." << endl;
                    }
                }
                break;
            } else if (purchaseItem == "N") { // no
                break;
            } else {
                cout << "Invalid option, try again." << endl;
            }
        }

        playerCounter++;


    }
    delete gameBoard;
}