#include <iostream>
#include <stdlib.h>
#include <time.h>

#include "GameBoard.h"
#include "Shop.h"

using namespace std;

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
    int playerCounter = 1;
    string rollVerify;
    srand(time(NULL));
    int roll;
    string purchaseItem;
    cout << "At any time, type B to show your balance" << endl; // TODO: MAKE SURE THIS WORKS
    while (!winner) {
        cout << "Player " << playerCounter << "'s turn!" << endl;
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
        cout << "Would you like to purchase something? Type Y or N." << endl;
        while (cin >> purchaseItem) {
            if (purchaseItem == "Y") {
                cout << "What would you like to purchase? Type N for nothing. Type L1 to list the options for dice rolls 1-6 and L2 for 7-12. " << endl;
                while(cin >> purchaseItem) {
                    if (purchaseItem == "N") {
                        break;
                    } else if (purchaseItem == "L1") {
                        // list options for 1-6
                    } else if (purchaseItem == "L2") {
                        // list options for 7-12
                    } else {
                        cout << "Invalid option, try again." << endl;
                    }
                }
            } else if (purchaseItem == "N") {
                break;
            } else {
                cout << "Invalid option, try again." << endl;
            }
        }

        playerCounter++;
        
        // red
        // green and blue
        // purple

        // if upgraded landmark, check if winner
    }
    delete gameBoard;
}