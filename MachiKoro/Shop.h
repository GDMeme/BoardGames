#pragma once

#include <string>
#include <vector>

class Shop {
    public:
        std::vector<std::vector<int>> amountOfIndustries; // red, blue, green
        std::vector<int> amountOfMajor;
        std::vector<std::string> redNames;
        std::vector<std::string> blueNames;
        std::vector<std::string> greenNames;
        std::vector<std::string> purpleNames; 
        
        Shop() {
            this->amountOfIndustries = {{6, 6}, {6, 6}, {6, 6}};
            this->amountOfMajor = {4, 4, 4};
            this->redNames = {"Cafe", "Family Restaurant"};
            this->blueNames = {"Wheat Field", "Ranch", "Forest", "Mine", "Apple Orchard"};
            this->greenNames = {"Bakery", "Convenience Store", "Cheese Factory", "Furniture Factory", "Fruit and Vegetable Market"};
            this->purpleNames = {"Stadium", "TV Station", "Business Center"};
        }

        ~Shop() {}
    private:

};